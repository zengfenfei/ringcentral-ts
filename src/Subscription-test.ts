import RestClient from './RestClient';
import Subscription from './Subscription';
import FileTokenStore from './FileTokenStore';
import config from '../test/config';

test();

async function test() {
    let restClient = new RestClient(config.app);
    await restClient.restoreToken(new FileTokenStore(config.tokenCacheFile));
    let sub = new Subscription(restClient);
    try {
        await sub.subscribe(['/restapi/v1.0/account/~/extension/~/presence']);
        sub.on('notification', msg => {
            console.log('>>>notification', msg);
        });
    } catch (e) {
        console.error(e);
    }

}
