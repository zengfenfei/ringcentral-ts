import * as fetchMock from 'fetch-mock';
import delay from 'delay.ts';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { auth } from '../test/setup';
import { getLastPubnub } from "../test/pubnub-mock";
import RingCentral from './Client';

let rc: RingCentral;

before(async () => {
	rc = await auth();
});

describe('Subscription', () => {

	it('receives notifications after subscribe', async () => {
		let sub = rc.createSubscription();
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
		fetchMock.once('*', ' ');
		await sub.cancel();
	});

	let expiresIn = 899;	// seconds
	let subId = '8c9ee34f-8096-4941';

	it('subscribeById', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(expiresIn, subId);
		fetchMock.getOnce('end:/subscription/' + subId, {
			body: subData
		});
		await sub.subscribeById(subId);
		expect(sub.id).to.eq(subId);
		expect(sub.expirationTime).to.eq(Date.parse(subData.expirationTime));
		expect(subData.eventFilters[0].endsWith(sub.eventFilters[0])).to.be.true;
		expect(sub.subscribeKey).to.eq(subData.deliveryMode.subscriberKey);
		expect(sub.address).to.eq(subData.deliveryMode.address);
		expect(sub.encryptionKey).to.eq(subData.deliveryMode.encryptionKey);

		fetchMock.once('*', ' ');
		await sub.cancel();
	});

	it('cancel subscription', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(expiresIn, subId);
		fetchMock.postOnce('end:/subscription', { body: subData });
		await sub.subscribe(['/test/subscription']);
		fetchMock.deleteOnce('end:/subscription/' + subId, ' ');
		await sub.cancel();
		expect(sub.id).to.be.null;
		expect(sub.pubnub).to.be.null;
	});

	it('refresh subscription', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(0.5, subId);
		fetchMock.postOnce('end:/subscription', { body: subData });
		await sub.subscribe(['/test/subscription']);
		let { expirationTime } = sub;
		fetchMock.putOnce('end:/subscription/' + subId, { body: createSubscriptionData(60, subId) });
		await delay(0.6 * 1000);
		expect(sub.expirationTime).to.not.eq(expirationTime);

		fetchMock.once('*', ' ');
		await sub.cancel();
	});

});

function createSubscriptionData(expiresIn: number, subId: string) {
	return {
		"uri": "https://platform.ringcentral.com/restapi/v1.0/subscription/" + subId,
		"id": subId,
		"creationTime": new Date().toISOString(),
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
	};
}

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