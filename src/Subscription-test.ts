import RestClient from './RestClient';
import Subscription from './Subscription';
import FileTokenStore from './FileTokenStore';
import delay from './delay';
import config from '../test/config';

/*
 Please run mocha with option --no-exit.
*/

let restClient = new RestClient(config.app);

before(async () => {
    await restClient.restoreToken(new FileTokenStore(config.tokenCacheFile));
});

describe('Subscription', () => {

    it.skip('should receive notifications forever', async () => {
        let sub = new Subscription(restClient);
        sub.on('notification', msg => {
            console.log('>>>notification', msg.body.telephonyStatus, msg);
        });
        sub.on('error', e => {
            console.error('Subscription error', e);
        });
        await sub.subscribe(['/restapi/v1.0/account/~/extension/~/presence']);
    });

    it.skip('should not receive notification after subscription canceled', async () => {
        let sub = new Subscription(restClient);
        sub.on('notification', msg => {
            console.log('>>>notification', msg.body.telephonyStatus, msg);
        });
        sub.on('error', e => {
            console.error('Subscription error', e);
        });
        await sub.subscribe(['/restapi/v1.0/account/~/extension/~/presence']);
        await delay(5 * 1000);
        await sub.cancel();
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
        await sub.subscribe(['/restapi/v1.0/account/~/extension/~/presence']);
        sub.on('notification', msg => {
            console.log('>>>notification', msg.body.telephonyStatus, msg);
        });
        setTimeout(() => {
            console.log('The subscription should expire now.');
            restClient.get('/subscription/' + sub.id).then(res => res.json()).then(subscription => {
                console.log("get subscription", subscription);
            });
            sub.refresh().catch(e => {
                console.error('Refresh error', e);
            });
        }, sub.expirationTime - Date.now());
    } catch (e) {
        console.error(e);
    }
}*/