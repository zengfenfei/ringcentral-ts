import Client from '../src/Client';
import config from './config';
import { TokenStore } from '../src/Token';
import FileTokenStore from '../src/FileTokenStore';
import WebTokenStore from '../src/WebTokenStore';

let tokenStore: TokenStore;

if (inNode()) {
	tokenStore = new FileTokenStore(config.tokenCacheFile);
} else {
	tokenStore = new WebTokenStore('ringcentral-ts-test-token', localStorage);
}

let client = new Client({ ...config.app, tokenStore });

export default client.getToken(config.user).catch(e => {
	console.log('No existed token, getting a new one');
	return client.auth(config.user);
}).then(() => client);

function inNode() {
	return typeof process !== 'undefined' && process.versions && process.versions.node;
}