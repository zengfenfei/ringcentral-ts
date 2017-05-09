// import { expect } from 'chai';
import Client from './Client';

let client = new Client({ appKey: '', appSecret: '' });

describe('client', () => {
	it('covers all', runCoverage);
});

function runCoverage() {
	client.clientInfo();
	client.numberPool();
	client.oauthUrl('redirectUrl');
	client.oauth('some-code', 'redirectUrl');
	client.getToken();
	client.logout();
}
