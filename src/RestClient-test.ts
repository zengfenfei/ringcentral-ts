import * as url from 'url';
import { expect } from 'chai';
import delay from 'delay.ts';
import * as fetchMock from 'fetch-mock';
import RestClient/*, { EventLoginStart, EventLoginError, EventLoginSuccess }*/ from './RestClient';
import Token from './Token';
import { auth } from '../test/setup';
import 'isomorphic-fetch';


let client: RestClient;
before(async () => {
	client = (await auth());
});

describe('RestClient Auth: auth, oauth, refreshToken, logout and related methods', () => {

	const server = 'https://platform.ringcentral.com';
	const appKey = 'testAppKey';
	const appSecret = 'testAppSecret';
	const authUrl = server + '/restapi/oauth/token';
	const serverToken = {
		access_token: 'MockAccessToken',
		token_type: 'bearer',
		expires_in: 3600,
		refresh_token: 'MockRefreshToken',
		refresh_token_expires_in: 604800,
		scope: 'ReadMessages Faxes ReadPresence EditCallLog VoipCalling ReadClientInfo Glip Interoperability Contacts ReadAccounts EditExtensions RingOut SMS InternalMessages SubscriptionWebhook EditMessages',
		owner_id: 'MockOwnerId',
		endpoint_id: 'MockEndpointId'
	};

	it('sends the right request and parse the response correctly for auth by password', async () => {
		let client = new RestClient({
			server,
			appKey,
			appSecret
		});

		let username = 'testUsername';
		let password = 'testPassword';

		fetchMock.postOnce(authUrl, serverToken);
		let token = await client.auth({
			username,
			password,
			scope: ['scp'],
			accessTokenTtl: 90,
			refreshTokenTtl: 360
		});
		// #1 Check the request
		expect(fetchMock.lastOptions()).to.deep.equal({
			body: 'grant_type=password&username=' + username + '&extension=&password=' + password + '&access_token_ttl=90&refresh_token_ttl=360&scope=scp',
			method: 'POST',
			headers:
				{
					'Content-Type': 'application/x-www-form-urlencoded',
					Authorization: 'Basic dGVzdEFwcEtleTp0ZXN0QXBwU2VjcmV0',
					'X-User-Agent': client.agents.join(' '),
				}
		});
		// #2 Check the parsed response
		let expectedToken = new Token();
		expectedToken.setOwner(appKey, { username });
		expectedToken.fromServer(serverToken, 0);
		expect(token.expiresIn).lt(expectedToken.expiresIn);
		expect(token.refreshTokenExpiresIn).lt(expectedToken.refreshTokenExpiresIn);
		expectedToken.expiresIn = token.expiresIn;
		expectedToken.refreshTokenExpiresIn = token.refreshTokenExpiresIn;
		expect(token).to.deep.equal(expectedToken);
	});

	it('reports invalid request error when auth with empty credential', () => {
		let client = new RestClient({
			server,
			appKey,
			appSecret
		});
		fetchMock.postOnce(authUrl, {
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
		let client = new RestClient({
			server,
			appKey,
			appSecret
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
				'error': 'invalid_client',
				'errors': [{
					'errorCode': 'OAU-153',
					'message': 'Invalid client: xx',
					'parameters': [{
						'parameterName': 'client_id',
						'parameterValue': 'xx'
					}]
				}],
				'error_description': 'Invalid client: xx'
			}
		});
		return service2.auth({ username: '', password: '' }).then(() => {
			throw 'Should not login:';
		}, e => {
			expect(e.code).to.equal('invalid_client');
		});
	});

	it('invalidates access token and refresh token after logout', async () => {
		let client = (await auth());
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
	});

	it('logout throws error', async () => {
		let client = (await auth());
		fetchMock.postOnce('end:/restapi/oauth/revoke', { status: 500, body: 'Internal error' });
		await client.logout().then(() => { throw new Error('Should throw'); }, e => { });

		fetchMock.postOnce('end:/restapi/oauth/revoke', {
			status: 500,
			headers: { 'content-type': ['application/json;charset=UTF-8'] },
			body: { code: 429, desc: 'Too many requests' }
		});
		await client.logout().then(() => { throw new Error('Should throw'); }, e => { });
	});

	it('creates correct login url for oauth', () => {
		const redirectUri = 'http://my-app.auth.com/TestOauth.RedirectUri';
		const state = 'Test.Oauth.State';
		const force = true;
		const loginUrl = client.oauthUrl(redirectUri, { state, force });
		const { query } = url.parse(loginUrl, true);
		expect(query['response_type']).to.eq('code');
		expect(query['client_id']).to.eq(appKey);
		expect(query['redirect_uri']).to.eq(redirectUri);
		expect(query['state']).to.eq(state);
		expect(query['force']).to.eq(force + '');
	});

	it('parses parameters from oauth callback', () => {
		const code = 'U0pDMDFQMDlQQVMwMnxBQURNTUd';
		const state = 'My:Code';
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
		let client = new RestClient({
			server,
			appKey,
			appSecret
		});
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
		let client = (await auth());
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
	});

	it('handles refresh token error', async () => {
		let client = (await auth());
		let token = await client.getToken();
		token.expiresIn = Date.now() - 10;

		fetchMock.postOnce('end:/oauth/token', {
			status: 401,
			body: { errorCode: 'some_error', error_description: 'Wrong credentials' },
			headers: { 'content-type': ['application/json;charset=UTF-8'], }
		});
		await client.getToken().then(() => { throw new Error('Should throw.'); }, e => { expect(e.code).to.eq('some_error'); });

		fetchMock.postOnce('end:/oauth/token', {
			status: 500,
			body: 'Unknown server error'
		});
		await client.getToken().then(() => { throw new Error('Should throw.'); }, e => { expect(e.code).to.eq('Unknown'); });

		fetchMock.postOnce('end:/oauth/token', {
			status: 401,
			body: { errorCode: 'invalid_grant', error_description: 'Wrong credentials' },
			headers: { 'content-type': ['application/json;charset=UTF-8'], }
		});
		await client.getToken().then(() => { throw new Error('Should throw.'); }, e => { expect(e.code).to.eq('invalid_grant'); });
	});

	it('allows only one getToken operation at the same time', () => {
		expect(client.getToken()).to.eq(client.getToken());
	});

});

describe('RestClient 429 handling', () => {

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

describe('RestClient API call methods', () => {

	let NotLoginError = 'NoToken';
	it('Call api before login', async () => {
		let client = (await auth());
		fetchMock.once('*', ' ');
		return client.logout().then(() => {
			return client.get('/some-api');
		}).then(async () => {
			throw new Error('Should not success.');
		}, async e => {
			expect(e.code).to.eq(NotLoginError);
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

		let testEndpoint = '/throw/text/exception';
		fetchMock.getOnce('end:' + testEndpoint, { status: 500, body: 'Some text error' });
		await client.call(testEndpoint).then(() => { throw new Error('Should throw'); }, e => { });
	});

	it('will delay API request automatically when rate limit hit', async () => {
		fetchMock.once('*', {
			status: 429,
			headers: {
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Expose-Headers': 'Date, RoutingKey, Content-Length, Content-Encoding',
				'Connection': 'keep-alive',
				'Content-Language': 'en',
				'Content-Length': 161,
				'Content-Type': 'application/json',
				Date: 'Wed, 29 Mar 2017 08:24:41 GMT',
				RCRequestId: '2844943a-1459-11e7-b99f-0050569792e2',
				'Retry-After': 1,
				Server: 'nginx/1.10.2',
				'WWW-Authenticate': 'Bearer realm="RingCentral REST API", error="CMN-301", error_description="Request rate exceeded"',
				'X-Rate-Limit-Group': 'medium',
				'X-Rate-Limit-Limit': 40,
				'X-Rate-Limit-Remaining': 0
			},
			body: {
				'errorCode': 'CMN-301',
				'message': 'Request rate exceeded',
				'errors': [{ 'errorCode': 'CMN-301', 'message': 'Request rate exceeded' }]
			}
		});
		let delayedPromise = client.call('/some/api');
		let delayedSampleData = 'Delayed result';
		fetchMock.once('*', delayedSampleData);
		let res = await delayedPromise;
		expect(await res.text()).to.eq(delayedSampleData);
	});

	it('will throw error immediately if client is in 429 state and the handle rate limit option is off when sending API request.', async () => {
		client.handleRateLimit = false;
		fetchMock.once('*', {
			status: 429,
			headers: {
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Expose-Headers': 'Date, RoutingKey, Content-Length, Content-Encoding',
				'Connection': 'keep-alive',
				'Content-Language': 'en',
				'Content-Length': 161,
				'Content-Type': 'application/json',
				Date: 'Wed, 29 Mar 2017 08:24:41 GMT',
				RCRequestId: '2844943a-1459-11e7-b99f-0050569792e2',
				'Retry-After': 1,
				Server: 'nginx/1.10.2',
				'WWW-Authenticate': 'Bearer realm="RingCentral REST API", error="CMN-301", error_description="Request rate exceeded"',
				'X-Rate-Limit-Group': 'medium',
				'X-Rate-Limit-Limit': 40,
				'X-Rate-Limit-Remaining': 0
			},
			body: {
				'errorCode': 'CMN-301',
				'message': 'Request rate exceeded',
				'errors': [{ 'errorCode': 'CMN-301', 'message': 'Request rate exceeded' }]
			}
		});
		try {
			await client.get('/some/api/429');
		} catch (e) {
			expect(e.code).to.eq(429);
			expect(e.retryAfter).to.gt(0);
		}
		try {
			await client.get('/some/api/429');
		} catch (e) {
			expect(e.code).to.eq(429);
			expect(e.retryAfter).to.gt(0);
		}
		client.handleRateLimit = true;
	});

	it('sends right request with shorthand methods', async () => {
		fetchMock.mock('*', { fake: 'data' }, { times: 3 });
		let endpoint = '/endpoint/for/delete';
		let query = { q: 'data' };
		let body = { p: 'body data' };
		let url = '/endpoint/for/delete?q=data';

		await client.delete(endpoint, query);
		expect(fetchMock.lastOptions()).to.have.property('method', 'DELETE');
		expect(fetchMock.lastUrl().endsWith(url)).to.be.true;

		await client.post(endpoint, body, query);
		expect(fetchMock.lastOptions()).to.have.property('method', 'POST');
		expect(fetchMock.lastUrl().endsWith(url)).to.be.true;

		await client.put(endpoint, body, query);
		expect(fetchMock.lastOptions().method).to.eq('PUT');
		expect(fetchMock.lastUrl().endsWith(url)).to.be.true;
	});

	it('disables handleRatelimit by constructor', () => {
		let rc = new RestClient({ appKey: '', appSecret: '', handleRateLimit: false });
		expect(rc.handleRateLimit).to.be.false;
	});

	it('throws error when getting expired token', async () => {
		let rc = new RestClient({ appKey: '', appSecret: '' });
		let t = new Token();
		t.setOwner('');
		t.expiresIn = Date.now() - 5000;
		t.refreshTokenExpiresIn = Date.now() - 5000;
		await rc.tokenStore.save(t);
		try {
			await rc.getToken();
			throw new Error('Should throw error');
		} catch (e) {
			expect(e.message).to.match(/Token expired/);
		}
	});

});
