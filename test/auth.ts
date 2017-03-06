import Client from '../src/Client';
import config from './config';
import { TokenStore } from '../src/Token';
import FileTokenStore from '../src/FileTokenStore';
import WebTokenStorage from '../src/WebTokenStorage';

let client = new Client(config.app);
let store: TokenStore;

if (inNode()) {
    store = new FileTokenStore(config.tokenCacheFile);
} else {
    store = new WebTokenStorage('ringcentral-ts-test-token', localStorage);
}

export default client.restoreToken(config.user, store).catch(e => {
    console.log('No existed token, getting a new one');
    return client.auth(config.user);
}).then(() => client);

function inNode() {
    return typeof process !== 'undefined' && process.versions && process.versions.node;
}