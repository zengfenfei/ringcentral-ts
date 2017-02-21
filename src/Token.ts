export default class Token {
    /** timeSpent: Time in ms spent fetching token. */
    constructor(data, timeSpent?: number) {
        if (timeSpent == null) {    // From cached data
            for (let p in data) {
                this[p] = data[p];
            }
            return;
        }
        this.accessToken = data["access_token"];
        this.type = data["token_type"];
        this.expiresIn = Date.now() + data["expires_in"] * 1000 - timeSpent;
        this.refreshToken = data["refresh_token"];
        this.refreshTokenExpiresIn = Date.now() + data["refresh_token_expires_in"] * 1000 - timeSpent;
        this.scope = data["scope"].split(" ");
        this.ownerId = data["owner_id"];
        this.endpointId = data["endpoint_id"];
    }

    accessToken: string;
    type: string;
    expiresIn: number;  // Date time
    refreshToken: string;
    refreshTokenExpiresIn: number;  // Date time
    scope: string[];    // Permissions
    ownerId: string;
    endpointId: string;

    expired(): boolean {
        return Date.now() >= this.expiresIn;
    }

    refreshTokenExpired(): boolean {
        return Date.now() >= this.refreshTokenExpiresIn;
    }
}

export interface TokenStore {
    // Fetch token data from redis, dababase, or other places
    restore(): Promise<void>;
    save(data: Token);
    get(): Token;
    clear(): void;
}

export class WebTokenStore implements TokenStore {
    key: string;
    store: Storage;

    constructor(key: string, store: Storage) {
        this.key = key;
        this.store = store;
    }

    save(data: Token) {
        this.store[this.key] = JSON.stringify(data);
    }
    get(): Token {
        let data = localStorage[this.key];
        if (data) {
            let json = JSON.parse(data);
            return new Token(json);
        }
    }
    async clear() {
        this.store.removeItem(this.key);
    }

    async restore(): Promise<void> {
    }
}

export class MemoryTokenStore implements TokenStore {
    token: Token;

    constructor() {
    }
    save(data: Token) {
        this.token = data;
    }
    get(): Token {
        return this.token;
    }
    clear() {
        this.token = null;
    }

    async restore(): Promise<void> {
    }
}