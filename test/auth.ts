import RingCentral from '../src/Client';
import * as fetchMock from 'fetch-mock';

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
fetchMock.once('*', serverToken);
export default rc.auth({ username: 'testUserName', password: 'testPassword' }).then(() => rc);