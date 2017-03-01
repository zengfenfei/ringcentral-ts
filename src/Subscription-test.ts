import RestClient from './RestClient';
import Subscription from './Subscription';
import FileTokenStore from './FileTokenStore';
import config from '../test/config';

test();

async function test() {
    let restClient = new RestClient(config.app);
    await restClient.restoreToken(new FileTokenStore(config.tokenCacheFile));
    let sub = new Subscription(restClient);
    sub.on('error', e => {
        console.error('Subscription error', e);
    });
    try {
        await sub.subscribe(['/restapi/v1.0/account/~/extension/~/presence']);
        console.log('Subscribed');
        sub.on('notification', msg => {
            console.log('>>>notification', msg.body.telephonyStatus, msg);
        });
    } catch (e) {
        console.error(e);
    }
}

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