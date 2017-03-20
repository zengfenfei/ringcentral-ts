import { EventEmitter } from 'events';
import * as assert from 'assert';
import * as PubNub from 'pubnub';
import { OPERATIONS, CATEGORIES } from 'pubnub';
import RestClient, { BASE_URL, API_VERSION } from './RestClient';

export default class Subscription extends EventEmitter {

	rest: RestClient;

	id: string;
	expirationTime: number; // Epoch time in ms.
	eventFilters: string[]; // Without REST base url
	subscribeKey: string;
	address: string;	// PubNub channels
	encryptionKey: string;	// AES encryptionKey

	refreshTimer: NodeJS.Timer;
	pubnub: any;

	constructor(restClient: RestClient) {
		super();
		this.rest = restClient;
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

		this.refreshTimer = setTimeout(() => {
			this.refreshTimer = null;
			this.refresh().catch(reason => {
				this.subscriptionDeleted();
				let e = new Error('Subscription auto refresh error: ' + reason);
				e['detail'] = reason;
				this.emit('error', e);
			});
		}, this.expirationTime - Date.now() - refreshHandicap);
	}

	private subscriptionDeleted() {
		this.id = '';
		this.expirationTime = 0;
		this.eventFilters = null;
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
     */
	async subscribe(eventFilters: string[]) {
		if (this.pubnub) {
			throw new Error('Subscription exists.');
		}
		eventFilters = prefixFilters(eventFilters);
		let res = await this.rest.post('/subscription', { eventFilters, deliveryMode });
		let subscription = await res.json();
		let pubnub = new PubNub({ subscribeKey: subscription.deliveryMode.subscriberKey, ssl: true });
		// Wrong address pubnub won't report error.
		pubnub.subscribe({ channels: [subscription.deliveryMode.address] });
		await new Promise((resolve, reject) => {
			pubnub.addListener({
				message: msg => {
					let decrypted = pubnub.decrypt(msg.message, subscription.deliveryMode.encryptionKey, {
						encryptKey: false,
						keyEncoding: 'base64',
						keyLength: 128,
						mode: 'ecb'
					});
					this.emit('message', decrypted);
				},
				status: status => {
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
						this.emit('error', e);
					} else {
						this.emit('status', status);
					}
				}
			});
		});

		this.pubnub = pubnub;
		this.subscriptionUpdated(subscription);
	}

	onMessage(listener: Function) {
		this.on('message', listener);
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