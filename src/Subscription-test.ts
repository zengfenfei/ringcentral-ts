import * as fetchMock from 'fetch-mock';
import delay from 'delay.ts';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { auth } from '../test/setup';
import { getLastPubnub } from '../test/pubnub-mock';
import RingCentral from './Client';

let rc: RingCentral;

before(async () => {
	fetchMock.catch('*', { throws: 'Unmatched request' });
	rc = await auth();
});
//afterEach(fetchMock.reset);

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
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(expiresIn);
		fetchMock.getOnce('end:/subscription/' + subData.id, {
			body: subData
		});
		sub.id = subData.id;
		await sub.subscribe();
		expect(sub.id).to.eq(subData.id);
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
		fetchMock.putOnce('end:/subscription/' + sub.id, { body: createSubscriptionData(1) });
		await sub.subscribe(['/presence']);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('cancel subscription', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(expiresIn);
		fetchMock.postOnce('end:/subscription', { body: subData });
		await sub.subscribe(['/test/subscription']);
		fetchMock.deleteOnce('end:/subscription/' + subData.id, ' ');
		await sub.cancel();
		expect(sub.id).to.be.null;
		expect(sub.pubnub).to.be.null;
		expect(sub.address).to.be.null;
		expect(sub.subscribeKey).to.be.null;
	});

	it('refresh subscription', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(2);
		fetchMock.postOnce('end:/subscription', { body: subData });
		await sub.subscribe(['/test/subscription']);
		let { expirationTime, id } = sub;
		let newData = createSubscriptionData(60);
		newData.id = subData.id;
		fetchMock.putOnce('end:/subscription/' + sub.id, { body: newData });
		await delay(1100);
		expect(sub.expirationTime).to.not.eq(expirationTime);
		expect(id).to.eq(sub.id);
		fetchMock.once('*', ' ');
		await sub.cancel();
	});

	it('cancel should work even when creating subscription request is in progress', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(60);
		fetchMock.postOnce('end:/subscription', async () => {
			await delay(200);
			return { body: subData };
		});
		let p1 = sub.subscribe(['/test/subscription']);

		fetchMock.deleteOnce('*', ' ');
		let p2 = sub.cancel();

		await Promise.all([p1, p2]);
		expect(sub.id).to.be.null;
		expect(sub.address).to.be.null;
		expect(sub.encryptionKey).to.be.null;
		//		expect(sub.eventFilters).to.deep.eq;
	});

	it('Cancel should work when update subscription request which throws error is in progress', async () => {
		let data = createSubscriptionData(8);
		let sub = rc.createSubscription();
		sub.retryInterval = 500;
		fetchMock.postOnce('end:/subscription', { body: data });
		await sub.subscribe(['/some/test']);
		fetchMock.putOnce('end:/subscription/' + sub.id, async () => {
			await delay(20);
			return { throws: { error: 'MockedError', desc: 'PUT subscription error.' } };
		});

		await delay(1010);
		fetchMock.deleteOnce('end:/subscription/' + sub.id, ' ');
		await sub.cancel();
		await delay(sub.retryInterval + 10);
		expect(sub.refreshTimer).to.be.null;
	});

	it('cancel should stop retry timer', async () => {
		// refresh: |--post(subscribe)--|----delay 0.4s-----|--put(refresh)--|--delay(error, retry)--|
		// cancel:                        |--del(cancel)--|
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(1500);
		fetchMock.postOnce('end:/subscription', { body: subData });
		fetchMock.putOnce('end:/subscription/' + subData.id, { throws: { error: 'MockedError', desc: 'stop retry timer' } });
		await sub.subscribe(['/test/subscription']);

		await delay(1100);
		fetchMock.deleteOnce('*', ' ');
		let p = sub.cancel();
		expect(sub.refreshTimer).to.be.null;
		await p;
	});

	it('resubscribe for expired subscription', async () => {
		let sub = rc.createSubscription();
		let subData = createSubscriptionData(-0.5);
		sub.setData(subData);
		let subData2 = createSubscriptionData(9);
		fetchMock.postOnce('end:/subscription', { body: subData2 });	// For the resubscribe of the refresh
		await delay(1100);
		expect(sub.id).to.not.eq(subData.id);
		expect(sub.id).to.eq(subData2.id);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('resubscribe for not found error', async () => {
		let sub = rc.createSubscription();
		let data1 = createSubscriptionData(2);
		sub.setData(data1);
		fetchMock.putOnce('end:/subscription/' + sub.id, { throws: { code: 'CMN-102', desc: 'Subscription not found' } });
		let data2 = createSubscriptionData(2);
		fetchMock.postOnce('end:/subscription', { body: data2 });
		await delay(1100);
		expect(sub.id).to.eq(data2.id);
		expect(sub.subscribeKey).to.eq(data2.deliveryMode.subscriberKey);

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});

	it('retry after refresh error', async () => {
		// let it retry 2 times
		let sub = rc.createSubscription();
		sub.retryInterval = 100;
		let subData = createSubscriptionData(8);
		sub.setData(subData);
		// refresh
		fetchMock.putOnce('end:/subscription/' + subData.id, {
			throws: { code: 'MockedRefreshError' }
		});
		// first retry
		fetchMock.putOnce('end:/subscription/' + subData.id, {
			throws: { code: 'MockedRefreshErrorForRetry1' }
		});
		let data = createSubscriptionData(5);
		// second retry
		fetchMock.putOnce('end:/subscription/' + subData.id, {
			body: data
		});
		await delay(1000 + sub.retryInterval * 2 + 20);
		expect(sub.expirationTime).to.eq(Date.parse(data.expirationTime));

		fetchMock.deleteOnce('*', ' ');
		await sub.cancel();
	});
});

function createSubscriptionData(expiresIn: number) {
	let subId = genSubId();
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
			'address': '601167281631840_012c5' + subId,
			'subscriberKey': 'sub-c-b8b9cd8c-e906-11e2-b383' + subId,
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
