export default class Token {

    setOwner(appKey: string, ownerInfo?: { username: string, extension?: string }) {
        this.appKey = appKey;
        this.owner = tokenOwner(ownerInfo);
    }

    validateOwner(appKey: string, ownerInfo?: { username: string, extension?: string }) {
        if (this.appKey !== appKey) {
            throw new Error('Token Restore error, appKey mismatch');
        }
        if (ownerInfo && this.owner !== tokenOwner(ownerInfo)) {
            throw new Error('Token Restore error, user info mismatch');
        }
    }

    /**
     * Restore from json string
     * @param serialized json string
     */
    static restore(serialized: string) {
        let token = new Token();
        let data = JSON.parse(serialized);
        for (let p in data) {
            token[p] = data[p];
        }
        return token;
    }

    /** Populate token from server response
     *  timeSpent: Time in ms spent fetching token.
     */
    update(data, timeSpent: number) {
        this.accessToken = data['access_token'];
        this.type = data['token_type'];
        this.expiresIn = Date.now() + data['expires_in'] * 1000 - timeSpent;
        this.refreshToken = data['refresh_token'];
        this.refreshTokenExpiresIn = Date.now() + data['refresh_token_expires_in'] * 1000 - timeSpent;
        this.scope = data['scope'].split(' ');
        this.ownerId = data['owner_id'];
        this.endpointId = data['endpoint_id'];
        return this;
    }

    accessToken: string;
    type: string;
    expiresIn: number;  // Date time
    refreshToken: string;
    refreshTokenExpiresIn: number;  // Date time
    scope: string[];    // Permissions
    ownerId: string;    // Extension identifier
    endpointId: string;

    // Ower info, these info will be checked after restored
    appKey: string;
    owner: string;   // format: {phone-number}*{extension-number}

    expired(): boolean {
        return Date.now() >= this.expiresIn;
    }

    refreshTokenExpired(): boolean {
        return Date.now() >= this.refreshTokenExpiresIn;
    }

    clone() {
        let newToken = new Token();
        return newToken;
    }
}

function tokenOwner(ownerInfo: { username: string, extension?: string }) {
    let owner = ownerInfo.username;
    if (ownerInfo.extension) {
        owner += '*' + ownerInfo.extension;
    }
    return owner;
}

export interface TokenStore {
    /**
     * Fetch token data from localStorage, redis, dababase, or other places
     * Return serialized token data
     */
    restore(): Promise<Token>;

    /**
     * Should handle error inside the method
     */
    save(data: Token): void;

    /**
     * Will be called every time making an API call. Should sync method
     */
    get(): Token;

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
        return null;
    }
}