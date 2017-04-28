import delay from 'delay.ts';
import * as fetchMock from 'fetch-mock';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { auth } from '../test/setup';
import { getLastPubnub } from "../test/pubnub-mock";
import Subscription from './Subscription';

let subscription: Subscription;

before(async () => {
	let rc = await auth();
	subscription = rc.createSubscription();

	subscription.on('StatusError', err => {
		console.log('!!!Subscription status error', err);
	});
	subscription.on('status', status => {
		console.log('Subscription pubnub status', status);
	});
	subscription.on('RefreshError', err => {
		console.log('Subscription refresh error:' + err);
	});
	subscription.on('RefreshSuccess', () => {
		console.log('Subscription refresh RefreshSuccess');
	});
});

describe('Subscription', () => {

	it('receives notifications after subscribe', async () => {
		let sub = subscription;
		let expiresIn = 899;	// seconds
		// POST https://platform.ringcentral.com/restapi/v1.0/subscription
		fetchMock.postOnce('end:/subscription', {
			body: {
				"uri": "https://platform.ringcentral.com/restapi/v1.0/subscription/8c9ee34f-8096-4941",
				"id": "8c9ee34f-8096-4941",
				"creationTime": "2017-03-20T06:04:01.726Z",
				"status": "Active",
				"eventFilters": ["/restapi/v1.0/account/305655028/extension/305655028/presence"],
				"expirationTime": new Date(Date.now() + expiresIn * 1000).toISOString(),
				expiresIn,
				"deliveryMode": {
					"transportType": "PubNub",
					"encryption": true,
					"address": "601167281631840_012c504c",
					"subscriberKey": "sub-c-b8b9cd8c-e906-11e2-b383-02ee2ddab7fe",
					"encryptionAlgorithm": "AES",
					"encryptionKey": "zcyzmb4ZcGKCCdr5IidJhA=="
				}
			}
		});

		await sub.subscribe(['/account/~/extension/~/presence']);
		let spy = sinon.spy();
		sub.onMessage(spy);
		let pubnub = getLastPubnub();
		let testMsg = {
			"uuid": "1088719898803550582-8036702296129764",
			"event": "/restapi/v1.0/account/37439510/extension/924428020/presence",
			"timestamp": "2017-02-09T11:21:07.074Z",
			"subscriptionId": "24dcfdcf-e7d0-4930-9edb-555ec11843b9",
			"body": {
				"extensionId": 924428020,
				"telephonyStatus": "Ringing",
				"presenceStatus": "Available",
				"userStatus": "Available",
				"dndStatus": "TakeAllCalls",
				"message": "custom",
				"allowSeeMyPresence": true,
				"ringOnMonitoredCall": false,
				"pickUpCallsOnHold": false
			}
		};
		let encrypted = pubnub.realPubnub.encrypt(JSON.stringify(testMsg), sub.encryptionKey, {
			encryptKey: false,
			keyEncoding: 'base64',
			keyLength: 128,
			mode: 'ecb'
		});
		pubnub.mockMessage(encrypted);

		expect(spy.calledWith(testMsg)).to.be.true;
	});

	it.skip('should not receive notification after subscription canceled', async () => {
		let sub = subscription;
		await sub.subscribe(['/account/~/extension/~/presence']);
		await delay(5 * 1000);
		await sub.cancel();
	});

	it.skip('should work when multiple instances created, and resubscribe after canceled', async () => {
		let filters = ['/account/~/extension/~/presence'];
		let sub = new Subscription(restClient);
		sub.onMessage(msg => console.log('##message of first subscription', msg.body.telephonyStatus));

		let sub2 = new Subscription(restClient);
		sub2.onMessage(msg => console.log('@@message of second subscription', msg.body.telephonyStatus));
		sub2.subscribe(filters);

		let sub3 = new Subscription(restClient);
		sub3.onMessage(msg => console.log('$$message of third subscription', msg.body.telephonyStatus));
		sub3.subscribe(filters);

		await sub.subscribe(filters);
		await delay(800);
		await sub.cancel();
		await delay(3000);
		await sub.subscribe(filters);
		await sub.cancel();
		await sub.subscribe(filters);

		await delay(15 * 1000);
		await sub.cancel();
		await sub2.cancel();
		await sub3.cancel();
	});

});

/*
errorCode: 'TokenInvalid',
message: 'Access token corrupted'

async function testRefreshExpiredSubscription() {
    let restClient = new RestClient(config.app);
    await restClient.restoreToken(new FileTokenStore(config.tokenCacheFile));
    let sub = new Subscription(restClient);
    try {
        await sub.subscribe(['/account/~/extension/~/presence']);
        sub.on('notification', msg => {
            console.log('>>>notification', msg.body.telephonyStatus, msg);
        });
        setTimeout(() => {
            console.log('The subscription should expire now.');
            restClient.get('/subscription/' + sub.id).then(res => res.json()).then(subscription => {
                console.log('get subscription', subscription);
            });
            sub.refresh().catch(e => {
                console.error('Refresh error', e);
            });
        }, sub.expirationTime - Date.now());
    } catch (e) {
        console.error(e);
    }
}*/