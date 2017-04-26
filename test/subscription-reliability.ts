import delay from 'delay.ts';
import RingCentral from '../src/Client';
import Subscription from '../src/Subscription';
import FileTokenStore from '../src/FileTokenStore';
import * as sinon from 'sinon';

/*
This file is to test the reliability and stability of the subscription.
Run it in a server as long as possible, it will tell you the status periodically. When errors occur, it will notify you by sms.
 */

test();

async function test() {
	let startTime = Date.now();
	let config = require('../../data/test-config.json');
	let rc = new RingCentral(config.app);
	rc.rest.tokenStore = new FileTokenStore(config.tokenCacheFile);
	try {
		await rc.getToken();
	} catch (e) {
		await rc.auth(config.user);
	}

	let subscription = rc.createSubscription({ debug: true });

	await subscription.subscribe(['/account/~/extension/~/presence', '/account/~/extension/~/message-store/instant?type=SMS']);

	checkStatus();
	setInterval(checkStatus, 24 * 60 * 60 * 1000);

	/**
	 * Subscribe sms and presence event.
	 * 
	 * Presence can't be updated by API, so use sms to trigger subscription.
	 */
	async function checkStatus() {
		let receivedSms;
		let messageListener = evt => {
			receivedSms = evt.body;
		};
		subscription.onMessage(messageListener);
		let sentSms = await rc.account().extension().sms().post({
			from: { phoneNumber: config.user.username },
			to: [{ phoneNumber: config.user.username }],
			text: 'Test sms to trigger subscription.'
		});
		await delay(5 * 1000);
		subscription.removeListener('message', messageListener);
		if (receivedSms) {
			notify('The subscription is alive');
			rc.account().extension().messageStore(receivedSms.id).delete({ purge: true });
			rc.account().extension().messageStore(sentSms.id).delete({ purge: true });
		} else {
			await notify('The subscription is dead');
			process.exit(1);
		}
	}

	async function notify(msg: string) {
		for (let phoneNumber of config.sms) {
			await rc.account().extension().sms().post({
				to: [{ phoneNumber }],
				from: { phoneNumber: config.user.username },
				text: 'Subsription reliability test:' + msg + '. duration:' + duration()
			})
		}
	};

	function duration() {
		return ((Date.now() - startTime) / 1000 / 60 / 60 / 24).toFixed(2) + ' days';
	}
}

return;

let restClient: RingCentral;
let subscription: Subscription;

before(async () => {
	subscription = new Subscription(restClient);
	subscription.onMessage(msg => {
		console.log('>>>Subscription message', msg);
	});
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

	it.skip('should receive notifications forever', async () => {
		let sub = subscription;
		await sub.subscribe(['/account/~/extension/~/presence']);
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