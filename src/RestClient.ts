import { EventEmitter } from 'events';
import { format } from 'url';
import { stringify, parse } from 'querystring';
import { TOO_MANY_REQUESTS } from 'http-status';
import 'isomorphic-fetch';
import delay from 'delay.ts';
import * as pkg from './pkg';
import Token, { TokenStore, MemoryTokenStore, ServerToken } from './Token';
import isKnownReqBodyType from 'known-fetch-body';
import RCAccount from './RCAccount';

export const SERVER_PRODUCTION = 'https://platform.ringcentral.com';
export const SERVER_SANDBOX = 'https://platform.devtest.ringcentral.com';

export const API_VERSION = 'v1.0';
export const BASE_URL = '/restapi/';
const TOKEN_URL = BASE_URL + 'oauth/token';
const REVOKE_URL = BASE_URL + 'oauth/revoke';
const AUTHORIZE_URL = BASE_URL + 'oauth/authorize';

// Auth events
export const EventLoginStart = 'LoginStart';
export const EventLoginSuccess = 'LoginSuccess';
export const EventLoginError = 'LoginError';
export const EventRefreshStart = 'RefreshStart';
export const EventRefreshSuccess = 'RefreshSuccess';
export const EventRefreshError = 'RefreshError';
export const EventLogoutStart = 'LogoutStart';
export const EventLogoutSuccess = 'LogoutSuccess';
export const EventLogoutError = 'LogoutError';


/**
 * A wrapper for sending http requests to RingCentralService.
 */
export default class RestClient extends EventEmitter {
	server: string;
	appKey: string;
	appSecret: string;

	handleRateLimit: boolean;
	private recoverTime = 0; // In 429 status

	tokenStore: TokenStore;
	private gettingToken: Promise<Token>;

	agents = [pkg.name + '/' + pkg.version];

	constructor(opts: ClientOptions) {
		super();
		this.server = opts.server || SERVER_PRODUCTION;
		this.appKey = opts.appKey;
		this.appSecret = opts.appSecret;
		this.tokenStore = opts.tokenStore || new MemoryTokenStore();
		this.handleRateLimit = opts.handleRateLimit === false ? false : true;

		let getToken = this.getToken;
		this.getToken = (ownerInfo?: RCAccount) => {
			if (!this.gettingToken) {
				this.gettingToken = getToken.call(this, ownerInfo).then(t => {
					this.gettingToken = null;
					return t;
				}, e => {
					this.gettingToken = null;
					throw e;
				});
			}
			return this.gettingToken;
		};
	}

	private basicAuth(): string {
		return new Buffer(this.appKey + ':' + this.appSecret).toString('base64');
	}

	/**
	 * Throw exception if no valid token.
	 */
	async getToken(ownerInfo?: RCAccount) {
		let token = await this.tokenStore.get();
		if (token) {
			token.validateOwner(this.appKey, ownerInfo);
			if (!token.expired()) {
				return token;
			} else if (!token.refreshTokenExpired()) {
				await this.refreshToken(token);
				await this.tokenStore.save(token);
				return token;
			} else {
				throw new Error('Token expired.');
			}
		} else {
			throw new Error('Token not exist.');
		}
	}

	async setToken(token: ServerToken) {
		let t = new Token();
		t.appKey = this.appKey;
		t.fromServer(token, 24 * 60 * 60 * 1000);
		this.tokenStore.save(t);
		return t;
	}

	/**
	 * Send http GET method
	 */
	get(url: string, query?: {}): Promise<Response> {
		return this.call(url, query);
	}

	delete(url: string, query?: {}): Promise<Response> {
		return this.call(url, query, { method: 'DELETE' });
	}

	/** Body can be Blob, FormData, URLSearchParams, String, Buffer or stream.Readable, any other type, plain object or instance of class will stringified as json. */
	post(url: string, body: any, query?: {}): Promise<Response> {
		return this.call(url, query, { method: 'POST', body: body });
	}

	/** Type of body is the same as post. */
	put(url: string, body: any, query?: {}): Promise<Response> {
		return this.call(url, query, { method: 'PUT', body: body });
	}

	// Handle rate limit.
	async call(endpoint: string, query?: {}, opts?: RequestInit): Promise<Response> {
		try {
			return await this.sendApiCall(endpoint, query, opts);
		} catch (e) {
			if (this.handleRateLimit && e.code === TOO_MANY_REQUESTS) {
				await delay(e['retryAfter']);
				return await this.call(endpoint, query, opts);
			}
			throw e;
		}
	}

	/**
	 * Perform an authenticated API call.
	 */
	private async sendApiCall(endpoint: string, query?: {}, opts?: RequestInit): Promise<Response> {
		opts = opts || {};
		opts.method = opts.method || 'GET';
		let pathname: string;
		if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
			pathname = endpoint;
		} else {
			pathname = this.server + BASE_URL + API_VERSION + endpoint;
		}
		let url = format({ pathname, query });

		if (this.recoverTime) {
			let timeLeft = this.recoverTime - Date.now();
			if (timeLeft > 0) {
				let e = new RestError(opts.method + ' ' + url + ': Throttled by rate limit', TOO_MANY_REQUESTS, 'Please retry after ' + timeLeft + ' milliseconds');
				e['retryAfter'] = timeLeft;
				throw e;
			}
			this.recoverTime = 0;
		}

		let token: Token;
		try {
			token = await this.getToken();
		} catch (e) {
			e.message = opts.method + ' ' + url + ', token error: ' + e.message;
			e['code'] = 'NoToken';
			throw e;
		}
		let headers = opts.headers = opts.headers || {};
		headers['Authorization'] = token.type + ' ' + token.accessToken;
		headers['Client-Id'] = this.appKey;
		headers['X-User-Agent'] = this.agents.join(' ');
		if (!isKnownReqBodyType(opts.body)) {
			opts.body = JSON.stringify(opts.body);
			headers['content-type'] = 'application/json';
		}
		let res = await fetch(url, opts);
		if (!res.ok) {
			let errorMessage = opts.method + ' ' + url + ': ';
			let resBody, code;
			if (isJsonRes(res)) {
				resBody = await res.json();
				errorMessage += resBody.message || resBody.error_description;
				code = resBody.errorCode || resBody.error;
			} else {
				resBody = await res.text();
				errorMessage += resBody;
				code = 'Unknown';
			}
			let e = new RestError(errorMessage, code, resBody, res);
			if (res.status === TOO_MANY_REQUESTS) {
				e.code = TOO_MANY_REQUESTS;
				// FIXME retry-after is custom header, by default, it can't be retrieved. Server should add header: 'Access-Control-Expose-Headers: retry-after'.
				let retryAfter = parseInt(res.headers.get('retry-after') || '60') * 1000;
				let newRecoverTime = Date.now() + retryAfter;
				this.recoverTime = newRecoverTime > this.recoverTime ? newRecoverTime : this.recoverTime;
				e['retryAfter'] = retryAfter;
			}
			throw e;
		}
		return res;
	}

	auth(opts: { username: string; password: string; extension?: string, accessTokenTtl?: number, refreshTokenTtl?: number, scope?: string[] }) {
		let body = {
			grant_type: 'password',
			username: opts.username,
			extension: opts.extension,
			password: opts.password,
			access_token_ttl: opts.accessTokenTtl,
			refresh_token_ttl: opts.refreshTokenTtl,
			scope: opts.scope && opts.scope.join(' ')
		};
		return this.authRequest(body, opts);
	}

	/**
	 * Login by oauth. http://ringcentral-api-docs.readthedocs.io/en/latest/oauth/
	 * @param callbackUrl The full oauth callback url with parameters returned from RingCentral.
	 */
	async oauthByUrl(callbackUrl: string, opts?: { accessTokenTtl: string; refreshTokenTtl: string }) {
		let parts = callbackUrl.split('?');
		let params = this.parseOauthCallback(parts[1]);
		return await this.oauth(params.code, parts[0], opts);
	}

	async oauth(code: string, redirectUri: string, opts?: { accessTokenTtl: string; refreshTokenTtl: string }) {
		let body = {
			grant_type: 'authorization_code',
			code: code,
			redirect_uri: redirectUri,
			access_token_ttl: opts && opts.accessTokenTtl,
			refresh_token_ttl: opts && opts.refreshTokenTtl
		};
		return await this.authRequest(body);
	}

	/**
	 * Parse parameters from oauth.
	 * @param paramsStr The query part of the RingCentral oauth call back url.
	 */
	parseOauthCallback(paramsStr: string): OauthCallbackParams {
		let params = parse(paramsStr);
		if (!params.code) {
			let e = new Error(params.error_description + '' || params.error + '' || 'No authorization code contained in the callback url.');
			e['code'] = params.error;
			throw e;
		}
		return <any>params;
	}

	/**
	 * Create the url of the oauth login window
	 * @param redirect_uri
	 * @param opts Refer to https://developer.ringcentral.com/api-docs/latest/index.html#!#RefAuthorization
	 */
	oauthUrl(redirect_uri: string, opts?: {
		state?: string;
		brand_id?: string;
		force?: boolean;
		display?: string;
		prompt?: string;
		localeId?: string;
		ui_locales?: string;
		ui_options?: string;
	}) {
		opts = opts || {};
		let query = {
			response_type: 'code',
			client_id: this.appKey,
			redirect_uri,
			...opts
		};
		return format({ pathname: this.server + AUTHORIZE_URL, query });
	}

	private async authRequest(body, user?: { username: string, extension?: string }) {
		this.emit(EventLoginStart);
		let startTime = Date.now();
		let res = await fetch(this.server + TOKEN_URL, {
			body: stringify(body),
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + this.basicAuth(),
				'X-User-Agent': this.agents.join(' ')
			}
		});
		if (res.ok) {
			let resJson = await res.json();
			let token = new Token();
			token.setOwner(this.appKey, user);
			await this.tokenStore.save(token.fromServer(resJson, Date.now() - startTime));
			this.emit(EventLoginSuccess);
			return token;
		} else {
			if (isJsonRes(res)) {
				let resJson = await res.json();
				let e = new RestError('RC platform auth fails: ' + (resJson.error_description || resJson.message),
					resJson.error || resJson.errorCode,
					resJson,
					res);
				this.emit(EventLoginError, e);
				throw e;
			} else {
				let resText = await res.text();
				let e = new RestError('RC platform auth fails: ' + resText, 'Unknown', resText, res);
				this.emit(EventLoginError, e);
				throw e;
			}
		}
	}

	async logout(): Promise<void> {
		let token = await this.getToken();
		this.emit(EventLogoutStart);
		let res = await fetch(this.server + REVOKE_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + this.basicAuth(),
				'X-User-Agent': this.agents.join(' ')
			},
			body: stringify({ token: token.accessToken })
		});
		if (res.ok) {
			await this.tokenStore.clear();
			this.emit(EventLogoutSuccess);
		} else {
			if (isJsonRes(res)) {
				let resJson = await res.json();
				let e = new RestError('Fail to logout RC platform: ' + (resJson.error_description || resJson.message),
					resJson.error || resJson.errorCode,
					resJson,
					res);
				this.emit(EventLogoutError, e);
				throw e;
			} else {
				let resText = await res.text();
				let e = new RestError('Fail to logout RC platform: ' + resText, 'Unknown', resText, res);
				this.emit(EventLogoutError, e);
				throw e;
			}
		}
	}

	/** Only one request will be sent at the same time. */
	private async refreshToken(token: Token): Promise<void> {
		let body = {
			refresh_token: token.refreshToken,
			grant_type: 'refresh_token',
			endpoint_id: token.endpointId
		};
		let startTime = Date.now();
		let res = await fetch(this.server + TOKEN_URL, {
			method: 'POST',
			body: stringify(body),
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Authorization': 'Basic ' + this.basicAuth()
			}
		});
		if (res.ok) {
			let resJson = await res.json();
			token.fromServer(resJson, Date.now() - startTime);
			this.emit(EventRefreshSuccess);
		} else {
			if (isJsonRes(res)) {
				let resJson = await res.json();
				let e = new RestError('Fail to refresh token: ' + (resJson.error_description || resJson.message),
					resJson.error || resJson.errorCode,
					resJson,
					res);
				if (e.code === 'invalid_grant') {	// Wrong token, clear them.
					await this.tokenStore.clear();
				}
				this.emit(EventRefreshError, e);
				throw e;
			} else {
				let resText = await res.text();
				let e = new RestError('Fail to refresh token: ' + resText, 'Unknown', resText, res);
				this.emit(EventRefreshError, e);
				throw e;
			}
		}

	}

}

function isJsonRes(res: Response) {
	let ct = res.headers.get('content-type');
	return ct && ct.match('application/json');
}

class RestError extends Error {
	code: string;
	detail: any;	// http response json or text
	rawRes: any;	// The raw http response

	constructor(message: string, code: string, detail?, raw?: Response) {
		super(message);
		this.code = code;
		this.detail = detail;
		this.rawRes = raw;
	}
}

export interface OauthCallbackParams {
	code: string;	// The authorization code returned for your application
	expires_in: number;	// The remaining lifetime of the authorization code
	state?: string;	// This parameter will be included in response if it was specified in the client authorization request. The value will be copied from the one received from the client
}

export interface ClientOptions {
	server?: string;
	appKey: string;
	appSecret: string;
	/** Default TokenStore is MemoryTokenStore */
	tokenStore?: TokenStore;
	handleRateLimit?: boolean;
}