import './pubnub-mock';
import RingCentral from '../src/Client';
import * as fetchMock from 'fetch-mock';

/*
Attention: Please make sure this file is included before all tests.
*/


export async function auth() {
	let rc = new RingCentral({ appKey: 'testAppKey', appSecret: 'testAppSecret' });

	let serverToken = {
		access_token: 'MockAccessToken',
		token_type: 'bearer',
		expires_in: 3600,
		refresh_token: 'MockRefreshToken',
		refresh_token_expires_in: 604800,
		scope: 'ReadMessages Faxes ReadPresence EditCallLog VoipCalling ReadClientInfo Glip Interoperability Contacts ReadAccounts EditExtensions RingOut SMS InternalMessages SubscriptionWebhook EditMessages',
		owner_id: 'MockOwnerId',
		endpoint_id: 'MockEndpointId'
	};
	fetchMock.postOnce('*', serverToken);
	await rc.auth({ username: 'testUserName', password: 'testPassword' });
	return rc;
}
