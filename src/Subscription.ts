import { EventEmitter } from 'events';
import * as assert from 'assert';
import * as PubNub from 'pubnub';
import { OPERATIONS, CATEGORIES } from 'pubnub';
import delay from 'delay.ts';
import RestClient, { BASE_URL, API_VERSION } from './RestClient';

/**
 * There are 3 ways to subscribe for notifications: by event filters; by subscription id; by subscription data.
 */
export default class Subscription extends EventEmitter {

	rest: RestClient;
	maxRefreshRetries = 10;

	id: string;
	expirationTime: number; // Epoch time in ms.
	eventFilters: string[]; // Without REST base url, can be set by user
	subscribeKey: string;
	address: string;	// PubNub channels
	encryptionKey: string;	// AES encryptionKey

	refreshTimer: NodeJS.Timer;
	pubnub: any;

	debug: boolean;

	constructor(restClient: RestClient, debug?: boolean) {
		super();
		this.rest = restClient;
		this.debug = debug;
	}

    /**
     * TODO Retry after refresh error.
     */
	private subscriptionUpdated(subscription) {
		if (!this.pubnub) {
			// The subscription is canceled.
			// If you try to cancel while the refresh is ongoing and the cancel request ends bofere the refresh request, when the refresh finishes, subscription id is deleted and the pubnub is also deleted.
			// We should not check subscription id to tell if the subscription is canceled, because the subscription id does not exist before subscribe.
			return;
		}
		if (!this.id) {
			this.id = subscription.id;
			this.subscribeKey = subscription.subscribeKey;
			this.address = subscription.address;
			this.encryptionKey = subscription.encryptionKey;
		} else {
			assert(this.id === subscription.id, 'Subscription id should not change');
			assert(this.subscribeKey === subscription.subscribeKey, 'SubscribeKey should not change');
			assert(this.address === subscription.address, 'Subscription channel should not change');
			assert(this.encryptionKey === subscription.encryptionKey, 'Subscription AES key should not change');
		}
		this.expirationTime = Date.parse(subscription.expirationTime);
		this.eventFilters = unprefixFilters(subscription.eventFilters);

		this.refreshTimer = setTimeout(async () => {
			this.refreshTimer = null;
			this.refresh().catch(async e => {
				this.subscriptionDeleted();
				e.message = 'Subscription refresh failed, will retry ' + this.maxRefreshRetries + ' times. Cause:' + e.message;
				this.emit(EventRefreshError, e);
				for (let i = 1; i <= this.maxRefreshRetries; i++) {
					try {
						await delay(3 * 1000);
						await this.subscribe(this.eventFilters);
						this.emit(EventRefreshSuccess);
						break;
					} catch (e2) {
						e2.message = 'Subscription refresh retry ' + i + '/' + this.maxRefreshRetries + ' failed. Cause:' + e2.message;
						this.emit(EventRefreshError, e2);
					}
				}
			});
		}, this.expirationTime - Date.now() - refreshHandicap);
	}

	private subscriptionDeleted() {
		this.id = '';
		this.expirationTime = 0;
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
		this.pubnub.removeAllListeners();
		this.pubnub.destroy();
		this.pubnub = null;
	}

	/**
	 * expiresIn Optional. Subscription lifetime in seconds. Max value is 7 days (604800 sec)
	 * The 'expiresIn' is not supported.
	 *
	 * Errors migh occur:
	 * errorCode: 'SUB-505',
	 * message: 'Subscriptions limit exceeded'
	 */
	async subscribe(eventFilters: string[]) {
		if (this.pubnub) {
			throw new Error('Subscription exists.');
		}
		eventFilters = prefixFilters(eventFilters);
		let res = await this.rest.post('/subscription', { eventFilters, deliveryMode });
		let subscription = await res.json();
		await this.subscribeByData(subscription);
	}

	/**
	 * 
	 * @param id The existing subscription id.
	 */
	async subscribeById(id: string) {
		let res = await this.rest.get('/subscription/' + id);
		let subscription = await res.json();
		await this.subscribeByData(subscription);
	}

	/**
	 * 
	 * @param subscription The subscription data returned from REST API.
	 */
	async subscribeByData(subscription) {
		await this.connectToPushServer(subscription);
		this.subscriptionUpdated(subscription);
	}

	async connectToPushServer(subscription) {
		let pubnub = new PubNub({ subscribeKey: subscription.deliveryMode.subscriberKey, ssl: true, keepAlive: true, logVerbosity: this.debug });
		// Wrong address pubnub won't report error.
		pubnub.subscribe({ channels: [subscription.deliveryMode.address] });
		await new Promise((resolve, reject) => {
			let message = msg => {
				let decrypted = pubnub.decrypt(msg.message, subscription.deliveryMode.encryptionKey, {
					encryptKey: false,
					keyEncoding: 'base64',
					keyLength: 128,
					mode: 'ecb'
				});
				// TODO Filter out duplicated notifications by uuid.
				this.emit(EventMessage, decrypted);
			};
			let status = status => {
				/*
				Good response:
				{   category: 'PNConnectedCategory',
					operation: 'PNSubscribeOperation'... }

				Wrong subscribeKey:
				{   error: true,
					operation: 'PNSubscribeOperation',
					category: 'PNBadRequestCategory'... }
				*/
				if (status.operation === OPERATIONS.PNSubscribeOperation) {
					if (status.category === CATEGORIES.PNConnectedCategory) {
						resolve();
						return;
					} else if (status.error) {
						let e = new Error('PubNub subscribe failed, ' + status.category);
						e['detail'] = status;
						pubnub.removeAllListeners();
						pubnub.destroy();
						reject(e);
						return;
					}
				}
				if (status.error) {
					let e = new Error('PubNub error status, category: ' + status.category);
					e['detail'] = status;
					this.emit(EventStatusError, e);
				} else {
					this.emit(EventStatus, status);
				}
			};
			pubnub.addListener({
				message,
				status
			});
		});

		this.pubnub = pubnub;
	}

	onMessage(listener: Function) {
		this.on(EventMessage, listener);
	}

	async cancel() {
		await this.rest.delete('/subscription/' + this.id);
		this.subscriptionDeleted();
	}

	private async refresh() {
		if (!this.id) {
			return;
		}
		if (Date.now() >= this.expirationTime) {
			throw Error('Subscription expired, can not refresh.');
		}
		let res = await this.rest.put('/subscription/' + this.id, { eventFilters: prefixFilters(this.eventFilters), deliveryMode });
		let subscription = await res.json();
		this.subscriptionUpdated(subscription);
		this.emit(EventRefreshSuccess);
	}

}

// Prefix with REST base url
function prefixFilters(filters: string[]) {
	return filters.map(f => BASE_URL + API_VERSION + f);
}

function unprefixFilters(filters: string[]) {
	return filters.map(f => f.replace(BASE_URL + API_VERSION, ''));
}

const deliveryMode = { transportType: 'PubNub', encryption: true };
// In ms
const refreshHandicap = 30 * 1000;
// In seconds
// export const MAX_LIFETIME = 604800;
// const ErrorNotFound = 'CMN-102';

// The list of events the subscription may emit.
const EventMessage = 'message';
const EventStatusError = 'StatusError'; // PubNub status event
const EventStatus = 'status';	// PubNub status event
const EventRefreshSuccess = 'RefreshSuccess';
const EventRefreshError = 'RefreshError';