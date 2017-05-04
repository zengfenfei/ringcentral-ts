import { EventEmitter } from 'events';
import * as PubNub from 'pubnub';
import delay from 'delay.ts';
import RestClient, { BASE_URL, API_VERSION } from './RestClient';

/**
 * There are 3 ways to subscribe for notifications: by event filters; by subscription id; by subscription data.
 */
export default class Subscription extends EventEmitter {

	rest: RestClient;

	// Subscription data
	id: string;
	expirationTime: number; // Epoch time in ms.
	eventFilters: string[]; // Without REST base url, can be set by user
	subscribeKey: string;
	address: string;	// PubNub channels
	encryptionKey: string;	// AES encryptionKey

	refreshTimer: NodeJS.Timer;
	retryInterval = 5000;
	pubnub: any;

	debug: boolean;

	constructor(restClient: RestClient, opts?: { debug?: boolean }) {
		super();
		this.rest = restClient;
		opts = opts || {};
		this.debug = opts.debug;
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
		eventFilters = prefixFilters(eventFilters);
		let res = await this.rest.post('/subscription', { eventFilters, deliveryMode });
		let subscription = await res.json();
		this.setData(subscription);
	}

	/**
	 *
	 * @param id The existing subscription id.
	 */
	async subscribeById(id: string) {
		let res = await this.rest.get('/subscription/' + id);
		let subscription = await res.json();
		this.setData(subscription);
	}

	/**
	 * Set subscription data from referesh, newly created or get by id.
	 */
	setData(subscription) { // This functions is the only place to parse subscription data.
		if (subscription.id !== this.id) {
			this.id = subscription.id;
			this.subscribeKey = subscription.deliveryMode.subscriberKey;
			this.address = subscription.deliveryMode.address;
			this.encryptionKey = subscription.deliveryMode.encryptionKey;
			this.connectPushServer();
		}
		this.expirationTime = Date.parse(subscription.expirationTime);
		this.eventFilters = unprefixFilters(subscription.eventFilters);

		this.clearRefreshTimer();
		let timeout = this.expirationTime - Date.now() - refreshHandicap;
		if (timeout <= 0) {
			timeout += refreshHandicap;
			timeout *= 0.8;
		}
		if (timeout <= 0) {
			timeout = 1000;
		}
		this.refreshTimer = setTimeout(async () => {
			this.refreshTimer = null;
			this.refresh().catch(async e => {
				e.message = 'Subscription refresh failed, will retry. Cause:' + e.message;
				this.emit(EventRefreshError, e);
				for (let i = 1; ; i++) {
					try {
						await delay(this.retryInterval);
						await this.refresh();
						this.emit(EventRefreshSuccess);
						break;
					} catch (e2) {
						e2.message = 'Subscription refresh retry ' + i + ' times failed. Cause:' + e2.message;
						this.emit(EventRefreshError, e2);
					}
				}
			});
		}, timeout);
	}

	async cancel() {
		this.clearRefreshTimer();
		this.disconnectPushServer();
		await this.rest.delete('/subscription/' + this.id);
		this.subscriptionDeleted();
	}

	onMessage(listener: Function) {
		this.on(EventMessage, listener);
	}


	private clearRefreshTimer() {
		if (this.refreshTimer) {
			clearTimeout(this.refreshTimer);
			this.refreshTimer = null;
		}
	}

	/**
	 * Subscription deleted from the RC Platform
	 */
	private subscriptionDeleted() {
		this.id = null;
		this.address = null;
		this.encryptionKey = null;
		this.expirationTime = 0;
		this.subscribeKey = null;
	}

	private connectPushServer() {
		this.disconnectPushServer();
		let pubnub = new PubNub({ subscribeKey: this.subscribeKey, restore: true, ssl: true, logVerbosity: this.debug });
		// Wrong address pubnub won't report error.
		pubnub.subscribe({ channels: [this.address] });
		let message = msg => {
			let decrypted = pubnub.decrypt(msg.message, this.encryptionKey, {
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
			Subscribe success event:
			{   category: 'PNConnectedCategory',
				operation: 'PNSubscribeOperation'... }

			Subscribe fail event:
			{   error: true,
				operation: 'PNSubscribeOperation',
				category: 'PNBadRequestCategory'... }
			*/
			if (status.error) {
				let e = new Error('PubNub error status, category: ' + status.category);
				e['detail'] = status;
				this.emit(EventStatusError, e);
				// pubnub.reconnect();
			} else {
				this.emit(EventStatus, status);
			}
		};
		pubnub.addListener({
			message,
			status
		});

		this.pubnub = pubnub;
	}

	private disconnectPushServer() {
		if (!this.pubnub) {
			return;
		}
		this.pubnub.removeAllListeners();
		this.pubnub.destroy();
		this.pubnub = null;
	}

	private async refresh() {
		if (!this.pubnub || !this.id) {
			return;
		}
		if (Date.now() >= this.expirationTime) {
			await this.subscribe(this.eventFilters);
			return;
		}
		let subscription;
		try {
			let res = await this.rest.put('/subscription/' + this.id, { eventFilters: prefixFilters(this.eventFilters), deliveryMode });
			subscription = await res.json();
		} catch (e) {
			if (e.code === ErrorNotFound) { // Network is ok, but server return error, the subscription may be invalidated.
				await this.subscribe(this.eventFilters);
				return;
			}
			throw e;
		}

		if (!this.pubnub) {  // Check if subscription is canceled. Ignore refreshed data if canceled
			return;
		}
		this.setData(subscription);
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
const ErrorNotFound = 'CMN-102';

// The list of events the subscription may emit.
const EventMessage = 'message';
const EventStatusError = 'StatusError'; // PubNub status event
const EventStatus = 'status';	// PubNub status event
const EventRefreshSuccess = 'RefreshSuccess';
const EventRefreshError = 'RefreshError';