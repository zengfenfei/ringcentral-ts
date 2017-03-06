export default class Token {
    /** timeSpent: Time in ms spent fetching token. */
    constructor(data, timeSpent?: number) {
        if (timeSpent == null) {    // From cached data
            for (let p in data) {
                this[p] = data[p];
            }
            return;
        }
        this.accessToken = data['access_token'];
        this.type = data['token_type'];
        this.expiresIn = Date.now() + data['expires_in'] * 1000 - timeSpent;
        this.refreshToken = data['refresh_token'];
        this.refreshTokenExpiresIn = Date.now() + data['refresh_token_expires_in'] * 1000 - timeSpent;
        this.scope = data['scope'].split(' ');
        this.ownerId = data['owner_id'];
        this.endpointId = data['endpoint_id'];
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
    /**
     * Fetch token data from localStorage, redis, dababase, or other places
     */
    restore(): Promise<void>;

    /**
     * Will be called every time making an API call. Should sync method
     */
    get(): Token;

    /**
     * Should handle error inside the method
     */
    save(data: Token): void;

    /**
     * Should handle error inside the method
     */
    clear(): void;
}

export class MemoryTokenStore implements TokenStore {
    token: Token;

    save(data: Token) {
        this.token = data;
    }

    get(): Token {
        return this.token;
    }

    clear() {
        this.token = null;
    }

    async restore() {
    }
}