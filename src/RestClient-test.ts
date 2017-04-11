import { expect } from 'chai';
import delay from 'delay.ts';
import RestClient/*, { EventLoginStart, EventLoginError, EventLoginSuccess }*/ from './RestClient';
import Token from './Token';
import config from '../test/config';
import auth from '../test/auth';

let client: RestClient;

before(async () => {
	client = (await auth).rest;
});

describe('Auth', () => {

	it('fail login, empty credential', () => {
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
		expect(client.getToken()).to.exist;
		await client.logout();
		expect(client.getToken()).to.not.exist;
		await client.auth(config.user);
		expect(client.getToken()).to.exist;
	});

	it('logout with wrong access token', async () => {
		let token = await client.getToken();
		let testToken = new Token();
		testToken.fromCache(JSON.stringify(token));

		client.tokenStore.save(testToken);
		testToken.accessToken += 'xxxxx';
		await client.logout();

		client.tokenStore.save(testToken);
		testToken.accessToken = '';
		await client.logout();

		client.tokenStore.save(token);
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

	it('Refresh token before login', () => {
		return client.logout().then(() => {
			//return client.refreshToken();
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