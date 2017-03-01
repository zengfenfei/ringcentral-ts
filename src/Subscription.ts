import { EventEmitter } from 'events';
import * as PubNub from 'pubnub';
import RestClient from './RestClient';

export default class Subscription extends EventEmitter {

    restClient: RestClient;
    id: string;
    expirationTime: number; // Epoch time in ms.
    eventFilters: string[];
    refreshTimer: NodeJS.Timer;

    pubnub: any;

    constructor(restClient: RestClient) {
        super();
        this.restClient = restClient;
    }

    /**
     * TODO Retry after refresh error.
     */
    private setSubscription(subscription) {
        this.id = subscription.id;
        this.expirationTime = Date.parse(subscription.expirationTime);
        this.eventFilters = subscription.eventFilters;
        this.refreshTimer = setTimeout(() => {
            this.refreshTimer = null;
            this.refresh().catch(reason => {
                this.clear();
                let e = new Error('Subscription auto refresh error: ' + reason);
                e['detail'] = reason;
                this.emit('error', e);
            });
        }, this.expirationTime - Date.now() + refreshHandicap);
    }

    private clear() {
        this.id = '';
        this.expirationTime = 0;
        this.eventFilters = null;
        this.refreshTimer = null;
    }

    /**
     * expiresIn Optional. Subscription lifetime in seconds. Max value is 7 days (604800 sec)
     * The 'expiresIn' is not supported.
     */
    async subscribe(eventFilters: string[]) {
        if (this.id) {
            throw new Error('Subscription exists.');
        }
        let res = await this.restClient.post('/subscription', { eventFilters, deliveryMode });
        let subscription = await res.json();
        let pubnub = new PubNub({ subscribeKey: subscription.deliveryMode.subscriberKey });
        pubnub.addListener({
            message: msg => {
                let decrypted = pubnub.decrypt(msg.message, subscription.deliveryMode.encryptionKey, {
                    encryptKey: false,
                    keyEncoding: 'base64',
                    keyLength: 128,
                    mode: 'ecb'
                });
                this.emit('notification', decrypted);
            },
            status: status => {
                /*
                Good response:
                {   category: 'PNConnectedCategory',
                    operation: 'PNSubscribeOperation',
                    affectedChannels: [ '3455148789617805_dc8d7011' ],
                    affectedChannelGroups: [] }

                Wrong subscribeKey:
                {   error: true,
                    operation: 'PNSubscribeOperation',
                    statusCode: 400,
                    errorData: ...
                    category: 'PNBadRequestCategory' }
                */
                if (status.error) {
                    let e = new Error('PubNub status error, category: ' + status.category);
                    e['detail'] = status;
                    this.emit('error', e);
                }
            }/*,
            presence: presence => {
                console.log('pubnub presence', presence);
            }*/
        });
        // Wrong address pubnub won't report error.
        pubnub.subscribe({ channels: [subscription.deliveryMode.address] });
        this.setSubscription(subscription);
        this.pubnub = pubnub;
    }

    private async refresh() {
        if (!this.id) {
            return;
        }
        if (Date.now() >= this.expirationTime) {
            throw Error('Subscription expired, can not refresh.');
        }
        let res = await this.restClient.put('/subscription/' + this.id, { eventFilters: this.eventFilters, deliveryMode });
        let subscription = await res.json();
        this.setSubscription(subscription);
    }

}

const deliveryMode = { transportType: 'PubNub', encryption: true };
// In ms
const refreshHandicap = 30 * 1000;
// In seconds
//export const MAX_LIFETIME = 604800;