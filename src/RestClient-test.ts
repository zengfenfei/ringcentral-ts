import { expect } from 'chai';
import delay from 'delay.ts';
import * as fetchMock from 'fetch-mock';
import RestClient/*, { EventLoginStart, EventLoginError, EventLoginSuccess }*/ from './RestClient';
import Token from './Token';
import config from '../test/config';
import 'isomorphic-fetch';

let server = 'https://platform.ringcentral.com';
let appKey = 'testAppKey';
let appSecret = 'testAppSecret';
let client = new RestClient({
	server,
	appKey,
	appSecret
});

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

before(async () => {
	await auth();
});

describe('Auth: auth, oauth, refreshToken, logout and related methods', () => {

	it('sends the right request and parse the response correctly for auth by password', async () => {
		let authUrl = server + '/restapi/oauth/token';
		let username = 'testUsername';
		let password = 'testPassword';

		fetchMock.once('*', serverToken);

		let token = await client.auth({
			username,
			password
		});
		// #1 Check the request
		expect(fetchMock.lastCall()).to.deep.equal([authUrl,
			{
				body: 'grant_type=password&username=' + username + '&extension=&password=' + password + '&access_token_ttl=&refresh_token_ttl=&scope=',
				method: 'POST',
				headers:
				{
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: 'Basic dGVzdEFwcEtleTp0ZXN0QXBwU2VjcmV0',
					'X-User-Agent': client.agents.join(' '),
				}
			}]);
		// #2 Check the parsed response
		let expectedToken = new Token();
		expectedToken.setOwner(appKey, { username })
		expectedToken.fromServer(serverToken, 0);
		expect(token.expiresIn).lt(expectedToken.expiresIn);
		expect(token.refreshTokenExpiresIn).lt(expectedToken.refreshTokenExpiresIn);
		expectedToken.expiresIn = token.expiresIn;
		expectedToken.refreshTokenExpiresIn = token.refreshTokenExpiresIn;
		expect(token).to.deep.equal(expectedToken);
	});

	it('reports invalid request error when auth with empty credential', () => {
		fetchMock.once('*', {
			status: 400,
			headers: {
				server: ['nginx/1.10.2'],
				date: ['Wed, 19 Apr 2017 08:32:50 GMT'],
				'content-type': ['application/json;charset=UTF-8'],
				'content-length': ['74'],
				connection: ['close'],
				rcrequestid: ['c6098c70-24da-11e7-95e2-0050569792e2'],
				routingkey: ['SJC01P07PAS11'],
				'www-authenticate': ['Basic realm="RingCentral REST API"'],
				'content-language': ['en']
			},
			body: {
				error: 'invalid_request',
				error_description: 'Resource Owner credentials are incomplete.'
			}
		});
		return client.auth({ username: '', password: '' }).then(() => {
			throw 'Should not login';
		}, e => {
			expect(e.code).to.equal('invalid_request');
		});
	});

	it('reports invalid_grant error when auth with wrong credential', () => {
		fetchMock.once('*', {
			status: 400,
			headers: {
				server: ['nginx/1.10.2'],
				date: ['Wed, 19 Apr 2017 09:01:56 GMT'],
				'content-type': ['application/json;charset=UTF-8'],
				'content-length': ['94'],
				connection: ['close'],
				rcrequestid: ['d708a05c-24de-11e7-ab11-00505697317c'],
				routingkey: ['SJC01P02PAS05'],
				'www-authenticate': ['Basic realm="RingCentral REST API"'],
				'x-rate-limit-group': ['auth'],
				'x-rate-limit-limit': ['200'],
				'x-rate-limit-remaining': ['200'],
				'x-rate-limit-window': ['60'],
				'content-language': ['en']
			},
			body: {
				error: 'invalid_grant',
				error_description: 'Invalid resource owner credentials.'
			}
		});
		return client.auth({ username: 'xxx', password: 'xxx' }).then(() => {
			throw 'Should not login';
		}, e => {
			expect(e.code).to.equal('invalid_grant');
		});
	});

	it('fail login, wrong appKey/appSecret', () => {
		let service2 = new RestClient({ appKey: 'xx', appSecret: 'xx' });
		fetchMock.once('*', {
			status: 400,
			headers: {
				server: ['nginx/1.10.2'],
				date: ['Wed, 19 Apr 2017 09:11:06 GMT'],
				'content-type': ['application/json;charset=UTF-8'],
				'transfer-encoding': ['chunked'],
				connection: ['close'],
				'x-application-context': ['application:docker:8080'],
				'content-language': ['en'],
				'www-authenticate': ['Bearer realm="RingCentral REST API", error="invalid_client", error_description="Invalid client: xx"'],
				rcrequestid: ['1eb0b524-24e0-11e7-95bf-0050569705a8'],
				aceroutingkey: ['sjc01-c01-ace01.dc004051-234c-11e7-9232-00505697c5a6'],
				'x-server-name': ['sjc01-c01-hlb01'],
				'x-request-time': ['0.020'],
				'x-upstream-server': ['10.13.121.174:60876'],
				'x-upstream-status': ['400'],
				'x-upstream-htime': ['0.020'],
				'x-upstream-rtime': ['1492593066.424'],
				'x-upstream-ctime': ['0.000'],
				'x-tcpinfo': ['1000, 500, 10, 28960']
			},
			body: {
				"error": "invalid_client",
				"errors": [{
					"errorCode": "OAU-153",
					"message": "Invalid client: xx",
					"parameters": [{
						"parameterName": "client_id",
						"parameterValue": "xx"
					}]
				}],
				"error_description": "Invalid client: xx"
			}
		});
		return service2.auth(config.user).then(() => {
			throw 'Should not login:';
		}, e => {
			expect(e.code).to.equal('invalid_client');
		});
	});

	it('invalidates access token and refresh token after logout', async () => {
		fetchMock.once('*', {
			status: 200, headers: {
				server: ['nginx/1.10.2'],
				date: ['Wed, 19 Apr 2017 09:22:16 GMT'],
				'content-length': ['0'],
				connection: ['close'],
				'x-application-context': ['application:docker:8080'],
				aceroutingkey: ['sjc01-c01-ace01.dc008e73-234c-11e7-9232-00505697c5a6'],
				rcrequestid: ['ae2763dc-24e1-11e7-9a55-005056979a38'],
				'x-server-name': ['sjc01-c01-hlb01'],
				'x-request-time': ['0.010'],
				'x-upstream-server': ['10.13.122.54:54579'],
				'x-upstream-status': ['200'],
				'x-upstream-htime': ['0.010'],
				'x-upstream-rtime': ['1492593736.616'],
				'x-upstream-ctime': ['0.000'],
				'x-tcpinfo': ['1000, 500, 10, 28960']
			},
			body: ''
		});
		await client.logout();
		let e;
		try {
			await client.getToken();
			e = new Error('Token not be available after logout.');
		} catch (e) {
			// console.log('get token after logout', e);
		}
		if (e) {
			throw e;
		}
		await auth();
	});

	/*	it('will not report error when logout with wrong access token', async () => {
			let token = await client.getToken();
			let testToken = new Token();
			testToken.fromCache(JSON.stringify(token));
	
			testToken.accessToken += 'xxxxx';
			client.tokenStore.save(testToken);
			await client.logout();
	
			testToken.accessToken = '';
			client.tokenStore.save(testToken);
			await client.logout();
	
			await client.tokenStore.save(token);
		});*/

	it('creates correct login url for oauth', () => {
		const redirectUri = 'http://my-app.auth.com/TestOauth.RedirectUri';
		const state = 'Test.Oauth.State';
		const force = true;
		const loginUrl = client.oauthUrl(redirectUri, { state, force });
		expect(loginUrl).to.eq(`https://platform.ringcentral.com/restapi/oauth/authorize?response_type=code&client_id=testAppKey&redirect_uri=${encodeURIComponent(redirectUri)}&force=${force}&state=${encodeURIComponent(state)}`);
	});

	it('parses parameters from oauth callback', () => {
		const code = 'U0pDMDFQMDlQQVMwMnxBQURNTUd';
		const state = 'My:Code'
		const params = client.parseOauthCallback('code=' + code + '&state=' + encodeURIComponent(state));
		expect(params.code).to.eq(code);
		expect(params.state).to.eq(state);
	});

	it('reports error specified in the oauth callback url', () => {
		try {
			client.parseOauthCallback('error=access_denied&error_description=The%2Buser%2Bdenied%2Baccess%2Bto%2Byour%2Bapplication');
			throw new Error('Should throw error');
		} catch (e) {
			expect(e.code).to.eq('access_denied');
			expect(e.message).to.eq('The+user+denied+access+to+your+application');
		}
	});

	it('login by oauth callback url', () => {
		fetchMock.once('*', serverToken);
		client.oauthByUrl('https://your-app.github.io/email-manipulator/?code=TheTestOauthCode');
		expect(fetchMock.lastCall()).to.deep.eq(['https://platform.ringcentral.com/restapi/oauth/token',
			{
				body: 'grant_type=authorization_code&code=TheTestOauthCode&redirect_uri=https%3A%2F%2Fyour-app.github.io%2Femail-manipulator%2F&access_token_ttl=&refresh_token_ttl=',
				method: 'POST',
				headers:
				{
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: 'Basic dGVzdEFwcEtleTp0ZXN0QXBwU2VjcmV0',
					'X-User-Agent': client.agents.join(' ')
				}
			}]);
	});

	it('should refresh token automatically if accessToken is invalid when getting token', async () => {
		let token = await client.getToken();
		const { accessToken, refreshToken } = token;
		token.expiresIn = Date.now() - 10;
		fetchMock.once('*', { ...serverToken, access_token: 'RefreshedAcessToken', refresh_token: 'newRefreshToken', });
		let newToken = await client.getToken();
		expect(fetchMock.lastCall()).to.deep.eq(['https://platform.ringcentral.com/restapi/oauth/token',
			{
				method: 'POST',
				body: 'refresh_token=MockRefreshToken&grant_type=refresh_token&endpoint_id=MockEndpointId',
				headers:
				{
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: 'Basic dGVzdEFwcEtleTp0ZXN0QXBwU2VjcmV0'
				}
			}]);
		expect(newToken.accessToken).not.eq(accessToken);
		expect(newToken.refreshToken).not.eq(refreshToken);
		await auth();
	});

	it('allows only one getToken operation at the same time', () => {
		expect(client.getToken()).to.eq(client.getToken());
	});

});

describe('429 handling', () => {

	it.skip('Check if requests in 429 state will postpone the recovering time.', async () => {
		let startTime = Date.now();
		let reqCount = 0;
		let minutesElapsed = 0;
		while (minutesElapsed < 30) {
			try {
				let n = 8;
				await sendRequests(n);
				reqCount += n;
				minutesElapsed = (Date.now() - startTime) / 1000 / 60;
				console.log('Requests sent per minute:', reqCount / minutesElapsed);
			} catch (e) {
				console.error('fail', e);
			}
		}

		// With throttling: 30q/s, Without throttling: 17q/s

		async function sendRequests(n: number) {
			client.get('/account/~/extension/');
			await delay(2 * 1000);
			let a = [];
			for (let i = 0; i < n - 1; i++) {
				a.push(client.get('/account/~/extension/'));
			}
			return await Promise.all(a);
		}
	});

});

describe('API calls', () => {

	let NotLoginError = 'NoToken';
	it('Call api before login', () => {
		fetchMock.once('*', ' ');
		return client.logout().then(() => {
			return client.get('/some-api');
		}).then(async () => {
			await auth();
			throw new Error('Should not success.');
		}, async e => {
			expect(e.code).to.eq(NotLoginError);
			await auth();
		});
	});

	it('calls API with correct parameters', async () => {
		let resData = { responseData: 'samples' };
		fetchMock.once('*', resData);
		let res = await client.call('/account/~',
			{ queryParams: 'value' }, {
				body: { jsonBody: 'value' },
				headers: { customHeader: 'customer-headers' }
			});
		expect(fetchMock.lastCall()).to.deep.eq(['https://platform.ringcentral.com/restapi/v1.0/account/~?queryParams=value',
			{
				body: '{"jsonBody":"value"}',
				headers:
				{
					customHeader: 'customer-headers',
					Authorization: 'bearer MockAccessToken',
					'Client-Id': 'testAppKey',
					'X-User-Agent': client.agents.join(' '),
					'content-type': 'application/json'
				},
				method: 'GET'
			}]);
		expect(await res.json()).to.deep.eq(resData);
	});

	it('throws error correctly when calling API', async () => {
		fetchMock.once('*', {
			status: 404,
			headers: {
				server: ['nginx/1.10.2'],
				date: ['Thu, 20 Apr 2017 07:42:57 GMT'],
				'content-type': ['application/json;charset=UTF-8'],
				'content-length': ['141'],
				connection: ['close'],
				rcrequestid: ['f88750c0-259c-11e7-bfc6-005056977b15'],
				routingkey: ['SJC01P13PAS05'],
				'content-language': ['en-US'],
				'x-rate-limit-group': ['medium'],
				'x-rate-limit-limit': ['40'],
				'x-rate-limit-remaining': ['39'],
				'x-rate-limit-window': ['60']
			}, body: {
				errorCode: 'CMN-120',
				message: 'Invalid URI',
				errors: [{ errorCode: 'CMN-120', message: 'Invalid URI' }]
			}
		});
		try {
			await client.call('/some/api/not/exist/', null, { body: 'string body' });
			throw new Error('Should throw error');
		} catch (e) {
			expect(e.code).to.eq('CMN-120');
		}
	});

});

async function auth() {
	fetchMock.once('*', serverToken);
	await client.auth({ username: '', password: '' });
}