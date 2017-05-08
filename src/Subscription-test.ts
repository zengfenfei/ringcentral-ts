import * as fetchMock from 'fetch-mock';
import delay from 'delay.ts';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { auth } from '../test/setup';
import { getLastPubnub } from '../test/pubnub-mock';
import RingCentral from './Client';

let rc: RingCentral;

before(async () => {
	rc = await auth();
});

describe('Subscription', () => {

	it('receives notifications after subscribe by event filters', async () => {
		let sub = rc.createSubscription();
		let expiresIn = 899;	// seconds
		// POST https://platform.ringcentral.com/restapi/v1.0/subscription
		fetchMock.postOnce('end:/subscription', {
			body: {
				'uri': 'https://platform.ringcentral.com/restapi/v1.0/subscription/8c9ee34f-8096-4941',
				'id': '8c9ee34f-8096-4941',
				'creationTime': '2017-03-20T06:04:01.726Z',
				'status': 'Active',
				'eventFilters': ['/restapi/v1.0/account/305655028/extension/305655028/presence'],
				'expirationTime': new Date(Date.now() + expiresIn * 1000).toISOString(),
				expiresIn,
				'deliveryMode': {
					'transportType': 'PubNub',
					'encryption': true,
					'address': '601167281631840_012c504c',
					'subscriberKey': 'sub-c-b8b9cd8c-e906-11e2-b383-02ee2ddab7fe',
					'encryptionAlgorithm': 'AES',
					'encryptionKey': 'zcyzmb4ZcGKCCdr5IidJhA=='
				}
			}
		});

		await sub.subscribe(['/account/~/extension/~/presence']);
		let spy = sinon.spy();
		sub.onMessage(spy);
		let pubnub = getLastPubnub();
		let testMsg = {
			'uuid': '1088719898803550582-8036702296129764',
			'event': '/restapi/v1.0/account/37439510/extension/924428020/presence',
			'timestamp': '2017-02-09T11:21:07.074Z',
			'subscriptionId': '24dcfdcf-e7d0-4930-9edb-555ec11843b9',
			'body': {
				'extensionId': 924428020,
				'telephonyStatus': 'Ringing',
				'presenceStatus': 'Available',
				'userStatus': 'Available',
				'dndStatus': 'TakeAllCalls',
				'message': 'custom',
				'allowSeeMyPresence': true,
				'ringOnMonitoredCall': false,
				'pickUpCallsOnHold': false
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

	it('subscribe by id', async () => {
		let subId = genSubId();
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(expiresIn, subId);
		fetchMock.getOnce('end:/subscription/' + subId, {
			body: subData
		});
		sub.id = subId;
		await sub.subscribe();
		expect(sub.id).to.eq(subId);
		expect(sub.expirationTime).to.eq(Date.parse(subData.expirationTime));
		expect(subData.eventFilters[0].endsWith(sub.eventFilters[0])).to.be.true;
		expect(sub.subscribeKey).to.eq(subData.deliveryMode.subscriberKey);
		expect(sub.address).to.eq(subData.deliveryMode.address);
		expect(sub.encryptionKey).to.eq(subData.deliveryMode.encryptionKey);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('throws error when subscribing without id and event filters', () => {
		let sub = rc.createSubscription();
		sub.subscribe().then(() => { throw new Error('Should not resolve'); }, e => { });
	});

	it('subscribe by id and event filters', async () => {
		let sub = rc.createSubscription();
		sub.id = genSubId();
		fetchMock.putOnce('end:/subscription/' + sub.id, { body: createSubscriptionData(1, sub.id) });
		await sub.subscribe(['/presence']);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('cancel subscription', async () => {
		let subId = genSubId();
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
		let subId = genSubId();
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

	/*it('should cancel existing subscription when subscribe', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(0.5, subId);
		fetchMock.postOnce('end:/subscription', { body: subData });
		await sub.subscribe(['/test/subscription']);
		fetchMock.once('*', ' ');	// delete subscription
		fetchMock.postOnce('end:/subscription', { body: subData });
		await sub.subscribe(['/test/subscription']);

		fetchMock.once('*', ' ');
		await sub.cancel();
	});*/

	it('cancel should stop retry timer', async () => {
		// refresh: |--post(subscribe)--|----delay 0.4s-----|--put(refresh)--|--delay(error, retry)--|
		// cancel:                        |--del(cancel)--|
		let subId = genSubId();
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(0.8, subId);
		fetchMock.postOnce('end:/subscription', { body: subData });
		fetchMock.putOnce('end:/subscription/' + subId, { throws: { error: 'MockedError', desc: 'stop retry timer' } });
		await sub.subscribe(['/test/subscription']);

		await delay(400);
		fetchMock.deleteOnce('*', ' ');
		sub.cancel();
	});

	it('resubscribe for expired subscription', async () => {
		let subId = genSubId();
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(-0.5, subId);
		sub.setData(subData);
		fetchMock.postOnce('end:/subscription', { body: subData });	// For the resubscribe of the refresh
		await delay(1100);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('resubscribe for not found error', async () => {
		let sub = rc.createSubscription();
		sub.setData(createSubscriptionData(0.4, genSubId()));
		fetchMock.putOnce('end:/subscription/' + sub.id, { throws: { code: 'CMN-102', desc: 'Subscription not found' } });
		fetchMock.postOnce('end:/subscription', { body: createSubscriptionData(1, genSubId()) });
		await delay(450);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('retry after refresh error', async () => {
		let subId = genSubId();
		// let it retry 2 times
		let sub = rc.createSubscription();
		sub.retryInterval = 900;
		let subData = createSubscriptionData(0.2, subId);
		sub.setData(subData);
		// refresh
		fetchMock.putOnce('end:/subscription/' + subData.id, {
			throws: { code: 'MockedRefreshError' }
		});
		// first retry
		fetchMock.once('*', {
			throws: { code: 'MockedRefreshErrorForRetry1' }
		});
		// second retry
		fetchMock.once('*', {
			body: createSubscriptionData(1, subId)
		});
		await delay(sub.retryInterval * 2 + 500);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});
});

function createSubscriptionData(expiresIn: number, subId: string) {
	return {
		'uri': 'https://platform.ringcentral.com/restapi/v1.0/subscription/' + subId,
		'id': subId,
		'creationTime': new Date().toISOString(),
		'status': 'Active',
		'eventFilters': ['/restapi/v1.0/account/305655028/extension/305655028/presence'],
		'expirationTime': new Date(Date.now() + expiresIn * 1000).toISOString(),
		expiresIn,
		'deliveryMode': {
			'transportType': 'PubNub',
			'encryption': true,
			'address': '601167281631840_012c504c',
			'subscriberKey': 'sub-c-b8b9cd8c-e906-11e2-b383-02ee2ddab7fe',
			'encryptionAlgorithm': 'AES',
			'encryptionKey': 'zcyzmb4ZcGKCCdr5IidJhA=='
		}
	};
}

let subIdx = 0;
function genSubId() {
	subIdx++;
	return 'test-sub-id-' + subIdx;
}
