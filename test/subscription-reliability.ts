import delay from 'delay.ts';
import RingCentral from '../src/Client';
import FileTokenStore from '../src/FileTokenStore';

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

	subscription.on('StatusError', err => {
		console.log('@@@@Subscription status error', err);
		notify('Subscription status error:' + JSON.stringify(err.detail, null, 4));
		checkStatus();
	});
	subscription.on('status', status => {
		console.log('@@@@Subscription pubnub status', status);
		notify('Subscription status event:' + JSON.stringify(status, null, 4));
	});
	subscription.on('RefreshError', err => {
		console.log('@@@@Subscription refresh error:' + err);
	});
	subscription.on('RefreshSuccess', () => {
		console.log('@@@@Subscription refresh RefreshSuccess,' + new Date());
	});

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