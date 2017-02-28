import { EventEmitter } from 'events';
import * as PubNub from 'pubnub';
import RestClient from './RestClient';

export default class Subscription extends EventEmitter {

    restClient: RestClient;
    subscription: any;
    pubnub: any;

    constructor(restClient: RestClient) {
        super();
        this.restClient = restClient;
    }

    /**
     * expiresIn Optional. Subscription lifetime in seconds. Max value is 7 days (604800 sec)
     * The 'expiresIn' is not supported.
     */
    async subscribe(eventFilters: string[]) {
        let res = await this.restClient.post('/subscription', { eventFilters, deliveryMode: { transportType: 'PubNub', encryption: true } });
        this.subscription = await res.json();
        let pubnub = new PubNub({ subscribeKey: this.subscription.deliveryMode.subscriberKey });
        console.log('Subscription', this.subscription)
        pubnub.addListener({
            message: msg => {
                let decrypted = pubnub.decrypt(msg.message, this.subscription.deliveryMode.encryptionKey, {
                    encryptKey: false,
                    keyEncoding: 'base64',
                    keyLength: 128,
                    mode: 'ecb'
                });
                this.emit('notification', decrypted);
            },
            status: status => {
                console.log('pubnub status event', status)
            },
            presence: presence => {
                console.log('pubnub presence', presence);
            }
        });
        pubnub.subscribe({ channels: [this.subscription.deliveryMode.address] });
        this.pubnub = pubnub;
    }

}

// In seconds
//export const MAX_LIFETIME = 604800;