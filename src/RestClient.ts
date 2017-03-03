import { EventEmitter } from 'events';
import { format } from 'url';
import { stringify } from 'querystring';
import * as fetch from 'isomorphic-fetch';
import delay from 'delay.ts';
//import { name as packageName, version as packageVersion } from './generated/package';
import Token, { TokenStore, MemoryTokenStore } from './Token';
import isKnownReqBodyType from 'known-fetch-body';

const SERVER_PRODUCTION = 'https://platform.ringcentral.com';
const SERVER_SANDBOX = 'https://platform.devtest.ringcentral.com';

const SERVER_VERSION = 'v1.0';

const TOKEN_URL = '/restapi/oauth/token';
const REVOKE_URL = '/restapi/oauth/revoke';

// Auth events
const EventLoginStart = 'LoginStart';
const EventLoginSuccess = 'LoginSuccess';
const EventLoginError = 'LoginError';
const EventRefreshStart = 'RefreshStart';
const EventRefreshSuccess = 'RefreshSuccess';
const EventRefreshError = 'RefreshError';
const EventLogoutStart = 'LogoutStart';
const EventLogoutSuccess = 'LogoutSuccess';
const EventLogoutError = 'LogoutError';

let pkg = require('../package.json');

/**
 * A wrapper for sending http requests to RingCentralService.
 */
export default class RestClient extends EventEmitter {
    server: string;
    appKey: string;
    appSecret: string;

    handleRateLimit: boolean;
    private recoverTime: number; // In 429 status

    tokenStore: TokenStore;
    private refreshingToken: Promise<void>;

    agents = [pkg.name + '/' + pkg.version];

    constructor(opts: ServiceOptions) {
        super();
        this.server = opts.server || SERVER_PRODUCTION;
        this.appKey = opts.appKey;
        this.appSecret = opts.appSecret;
        this.tokenStore = opts.tokenStore || new MemoryTokenStore();
        this.handleRateLimit = opts.handleRateLimit === false ? false : true;
    }

    private basicAuth(): string {
        return new Buffer(this.appKey + ':' + this.appSecret).toString('base64');
    }

    getToken(): Token {
        return this.tokenStore.get();
    }

    async restoreToken(tokenStore?: TokenStore): Promise<void> {
        if (tokenStore) {
            this.tokenStore = tokenStore;
        }
        await this.tokenStore.restore();
        let token = this.getToken();
        if (!token) {
            throw new Error('Token not exists, fail to restore.');
        }
        if (token.expired()) {
            if (token.refreshTokenExpired()) {
                this.tokenStore.clear();
                throw new Error('Token expired.');
            } else {
                await this.refreshToken();
            }
        }
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
            if (this.handleRateLimit && e.code === ErrorRateExceeded) {
                await delay(this.recoverTime - Date.now());
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
        let url = format({ pathname: this.server + '/restapi/' + SERVER_VERSION + endpoint, query });

        if (this.recoverTime) {
            let timeLeft = this.recoverTime - Date.now();
            if (timeLeft > 0) {
                let e = new RestError(opts.method + ' ' + url + ': Throttled by rate limit', ErrorRateExceeded, 'Please retry after ' + timeLeft + ' milliseconds');
                e['retryAfter'] = timeLeft;
                throw e;
            }
            this.recoverTime = 0;
        }

        let token = this.getToken();
        if (!token) {
            let e = new Error('Cannot perform api calls without login.');
            e['code'] = 'NoToken';
            throw e;
        }
        if (token.expired()) {
            if (token.refreshTokenExpired()) {
                let e = new Error('AccessToken and refreshToken have expired.');
                e['code'] = 'TokenExpired';
                throw e;
            } else {
                await this.refreshToken();
            }
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
            if (isJsonRes(res)) {
                let resJson = await res.json();
                let e = new RestError(errorMessage + (resJson.message || resJson.error_description),
                    resJson.errorCode || resJson.error,
                    resJson,
                    res);
                if (e.code === ErrorRateExceeded) {
                    let retryAfter = parseInt(res.headers.get('retry-after')) * 1000;
                    this.recoverTime = Date.now() + retryAfter;
                    e['retryAfter'] = retryAfter;
                }
                throw e;
            } else {
                let resText = await res.text();
                let e = new RestError(errorMessage + resText, 'Unknown', resText, res);
                throw e;
            }
        }
        return res;
    }

    async auth(opts: { username: string; password: string; extension?: string, accessTokenTtl?: number, refreshTokenTtl?: number, scope?: string[] }): Promise<void> {
        let tokenData = this.tokenStore.get();
        let body = {
            grant_type: 'password',
            username: opts.username,
            extension: opts.extension,
            password: opts.password,
            access_token_ttl: opts.accessTokenTtl,
            refresh_token_ttl: opts.refreshTokenTtl,
            scope: opts.scope && opts.scope.join(' ')
        };
        this.emit(EventLoginStart);
        let startTime = Date.now();
        let res = await fetch(this.server + TOKEN_URL, {
            body: stringify(body),
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + this.basicAuth()
            }
        });
        if (res.ok) {
            let resJson = await res.json();
            this.tokenStore.save(new Token(resJson, Date.now() - startTime));
            this.emit(EventLoginSuccess);
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
        let token = this.tokenStore.get();
        if (!token) {
            return;
        }
        this.emit(EventLogoutStart);
        let res = await fetch(this.server + REVOKE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + this.basicAuth()
            },
            body: stringify({ token: token.accessToken })
        });
        if (res.ok) {
            this.tokenStore.clear();
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
    refreshToken(): Promise<void> {
        if (this.refreshingToken) {
            return this.refreshingToken;
        }

        let token = this.getToken();
        if (!token) {
            let e = new Error('Cannot refresh token without existing one.');
            e['code'] = 'NoToken';
            return Promise.reject(e);
        }

        this.emit(EventRefreshStart);
        if (token.refreshTokenExpired()) {
            let e = new Error('Cannot refresh token, existed refreshToken has expired.');
            e['code'] = 'RefreshTokenExpired';
            this.emit(EventRefreshError, e);
            return Promise.reject(e);
        }

        this.refreshingToken = this.fetchNewToken().then(() => {
            this.refreshingToken = null;
        }, e => {
            this.refreshingToken = null;
            throw e;
        });
        return this.refreshingToken;
    }

    private async fetchNewToken(): Promise<void> {
        let token = this.getToken();
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
            this.tokenStore.save(new Token(resJson, Date.now() - startTime));
            this.emit(EventRefreshSuccess);
        } else {
            if (isJsonRes(res)) {
                let resJson = await res.json();
                let e = new RestError('Fail to refresh token: ' + (resJson.error_description || resJson.message),
                    resJson.error || resJson.errorCode,
                    resJson,
                    res);
                if (e.code == 'invalid_grant') {    // Token is invalid, clear them.
                    this.tokenStore.clear();
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
    detail: any;    // http response json or text
    rawRes: any;    // The raw http response

    constructor(message: string, code: string, detail?, raw?: Response) {
        super(message);
        this.code = code;
        this.detail = detail;
        this.rawRes = raw;
    }
}

const ErrorRateExceeded = 'CMN-301';

interface ServiceOptions {
    server?: string;
    appKey: string;
    appSecret: string;
    /** Default TokenStore is MemoryTokenStore */
    tokenStore?: TokenStore;
    handleRateLimit?: boolean;
}


export {
    SERVER_PRODUCTION,
    SERVER_SANDBOX,
    SERVER_VERSION,

    EventLoginStart,
    EventLoginSuccess,
    EventLoginError,
    EventRefreshStart,
    EventRefreshSuccess,
    EventRefreshError,
    EventLogoutStart,
    EventLogoutSuccess,
    EventLogoutError,

    ServiceOptions
}