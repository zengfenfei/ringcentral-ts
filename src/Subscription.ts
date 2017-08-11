import { EventEmitter } from 'events';
import * as PubNub from 'pubnub';
import RestClient, { BASE_URL, API_VERSION } from './RestClient';

/**
 * There are 3 ways to subscribe for notifications: by event filters; by subscription id; by subscription data.
 */
export default class Subscription extends EventEmitter {

	rest: RestClient;

	id: string;
	eventFilters: string[]; // Without REST base url, can be set by user

	// Readonly Subscription data
	expirationTime: number; // Epoch time in ms.
	subscribeKey: string;
	address: string;	// PubNub channels
	encryptionKey: string;	// AES encryptionKey

	refreshTimer: NodeJS.Timer;
	retryInterval = 5000;
	pubnub: any;

	debug: boolean;

	private reqId = 0;

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
	async subscribe(filters?: string[]) {
		if (filters) {
			this.eventFilters = filters;
		}

		let { eventFilters, id } = this;
		if (!eventFilters && !id) {
			throw new Error('Event filter or subscription id is needed.');
		}
		if (eventFilters && id) {
			await this.refresh();
			return;
		}
		this.reqId++;
		let reqId = this.reqId;
		let res: Response;
		if (eventFilters) {
			res = await this.rest.post('/subscription', { eventFilters: prefixFilters(eventFilters), deliveryMode });
		} else {
			res = await this.rest.get('/subscription/' + id);
		}
		let subscription = await res.json();
		this.setData(subscription, reqId);
	}

	/**
	 * Set subscription data from referesh, newly created or get by id.
	 */
	setData(subscription, reqId?: number) { // This functions is the only place to parse subscription data.
		if (reqId && reqId < this.reqId) {
			// Subscription is canceled
			// The request is too slow that former request arrived early than this one, so should ignore this response
			return;
		}
		if (subscription.id !== this.id || !this.subscribeKey) {
			this.id = subscription.id;
			this.subscribeKey = subscription.deliveryMode.subscriberKey;
			this.address = subscription.deliveryMode.address;
			this.encryptionKey = subscription.deliveryMode.encryptionKey;
			this.connectPushServer();
		}
		this.expirationTime = Date.parse(subscription.expirationTime);
		this.eventFilters = unprefixFilters(subscription.eventFilters);

		let timeout = Math.max(this.expirationTime - Date.now() - refreshHandicap, 1000);
		this.scheduleRefresh(timeout);
	}

	async cancel() {
		this.clearRefreshTimer();
		this.disconnectPushServer();
		const id = this.id;
		this.subscriptionDeleted();
		this.reqId++;
		await this.rest.delete('/subscription/' + id);
	}

	onMessage(listener: (...args: any[]) => void) {
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

	private scheduleRefresh(timeout: number) {
		this.clearRefreshTimer();
		this.refreshTimer = setTimeout(async () => {
			this.refreshTimer = null;
			if (!this.id) return;
			this.refresh().catch(async e => {
				e.message = `Subscription refresh failed, will retry in ${this.retryInterval}ms. Cause: ${e.message}`;
				this.emit(EventRefreshError, e);
				this.scheduleRefresh(this.retryInterval);
			});
		}, timeout);
	}

	private async refresh() {
		if (Date.now() >= this.expirationTime) {
			this.id = null;
			await this.subscribe();
			return;
		}
		let subscription;
		this.reqId++;
		let reqId = this.reqId;
		try {
			let res = await this.rest.put('/subscription/' + this.id, { eventFilters: prefixFilters(this.eventFilters), deliveryMode });
			subscription = await res.json();
		} catch (e) {
			if (reqId < this.reqId) return;
			if (e.code === ErrorNotFound) { // The subscription is invalidated, resubscribe
				this.id = null;
				await this.subscribe(this.eventFilters);
				return;
			}
			throw e;
		}
		this.setData(subscription, reqId);
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
const refreshHandicap = 10 * 1000;
// In seconds
// export const MAX_LIFETIME = 604800;
const ErrorNotFound = 'CMN-102';

// The list of events the subscription may emit.
const EventMessage = 'message';
const EventStatusError = 'StatusError'; // PubNub status event
const EventStatus = 'status';	// PubNub status event
const EventRefreshSuccess = 'RefreshSuccess';
const EventRefreshError = 'RefreshError';