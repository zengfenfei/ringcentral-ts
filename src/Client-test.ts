import * as fetchMock from 'fetch-mock';
import { auth } from '../test/setup';
import Client from './Client';

let rc: Client;

describe('client', () => {
	it('covers all', runCoverage);
});

async function runCoverage() {
	rc = await auth();
	rc.clientInfo();
	rc.numberPool();
	rc.oauthUrl('redirectUrl');
	await rc.getToken();
	fetchMock.postOnce('end:/oauth/revoke', ' ');
	await rc.logout();
	fetchMock.postOnce('end:/oauth/token', { scope: '' });
	await rc.oauth('some-code', 'redirectUrl');
}
