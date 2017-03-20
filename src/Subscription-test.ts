import delay from 'delay.ts';
import RestClient from './RestClient';
import Subscription from './Subscription';
// import config from '../test/config';
import auth from '../test/auth';

/*
 Please run mocha with option --no-exit.
*/

let restClient: RestClient;

before(async () => {
	restClient = (await auth).rest;
});

describe('Subscription', () => {

	it.skip('should receive notifications forever', async () => {
		let sub = new Subscription(restClient);
		sub.onMessage(msg => {
			console.log('>>>notification', msg.body.telephonyStatus, msg);
		});
		sub.on('error', e => {
			console.error('Subscription error', e);
		});
		await sub.subscribe(['/account/~/extension/~/presence']);
	});

	it.skip('should not receive notification after subscription canceled', async () => {
		let sub = new Subscription(restClient);
		sub.onMessage(msg => {
			console.log('>>>notification', msg.body.telephonyStatus, msg);
		});
		sub.on('error', e => {
			console.error('Subscription error', e);
		});
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