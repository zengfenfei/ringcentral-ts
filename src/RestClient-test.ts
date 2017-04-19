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

before(async () => {
	//client = (await auth).rest;
});

describe('Auth', () => {

	it.only('sends the right request and parse the response correctly for auth by password', async () => {
		let authUrl = server + '/restapi/oauth/token';
		let username = 'testUsername';
		let password = 'testPassword';
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

	it.only('reports invalid request error when auth with empty credential', () => {
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

	it('fail login, wrong credential', () => {
		return client.auth({ username: 'xxx', password: 'xxx' }).then(() => {
			throw 'Should not login';
		}, e => {
			expect(e.code).to.equal('invalid_grant');
		});
	});

	it('fail login, wrong appKey/appSecret', () => {
		let service2 = new RestClient({ appKey: 'xx', appSecret: 'xx' });
		return service2.auth(config.user).then(() => {
			throw 'Should not login:';
		}, e => {
			expect(e.code).to.equal('invalid_client');
		});
	});

	it('invalidates access token and refresh token after logout', async () => {
		let token = await client.getToken();
		expect(token.expired()).be.false;
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
		await client.auth(config.user);
	});

	it('will not report error when logout with wrong access token', async () => {
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
	});

	let NotLoginError = 'NoToken';
	it('Call api before login', () => {
		return client.logout().then(() => {
			return client.get('/some-api');
		}).then(() => {
			throw new Error('Should not success.');
		}, e => {
			expect(e.code).to.eq(NotLoginError);
		});
	});

	it('login with right credential', () => {
		return client.auth(config.user).then(async () => {
			let token = await client.getToken();
			expect(token.expired()).to.be.false;
			expect(token.refreshTokenExpired()).to.be.false;
		});
	});

    /*it('Login will try to use cached token', () => {
        let cachedAccessToken;
        let service2 = new RestClient(.app);
        return service.login(authConfig.user).then(() => {
            cachedAccessToken = service.tokenStore.get().token.accessToken;
            return service2.login(authConfig.user);
        }).then(() => {
            let cur = service2.tokenStore.get().token.accessToken;
            expect(cachedAccessToken).to.eql(cur);
        });
    });*/

	/*	it('Allow only one refresh token request at the same time.', () => {
			let p1 = client.refreshToken();
			let p2 = client.refreshToken();
			expect(p1).to.eq(p2);
			return p1;
		});*/

	/*	it('should get different access token after refresh.', async () => {
			let token = client.getToken();
			await client.refreshToken();
			expect(token.accessToken).not.eq(client.getToken().accessToken);
		});*/

	/*	it('Refresh token with wrong refreshToken', () => {
			let token = client.getToken();
			let testToken = new Token();
			testToken.fromCache(JSON.stringify(token));
			testToken.refreshToken = 'xxxxx';
			client.tokenStore.save(testToken);
			return client.refreshToken().then(() => {
				throw new Error('Refresh token should not success with wrong refresh token.');
			}, e => {
				expect(e.code).to.eq('invalid_grant');
				client.tokenStore.save(token);
			});
		});*/

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