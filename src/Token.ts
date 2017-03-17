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
	 * Restore from cached data
	 */
	fromCache(cached) {
		for (let p in cached) {
			this[p] = cached[p];
		}
		return this;
	}

    /**
     *  Populate token from server response.
     *  timeSpent: Time in ms spent fetching token.
     */
	fromServer(newToken, timeSpent: number) {
		this.accessToken = newToken['access_token'];
		this.type = newToken['token_type'];
		this.expiresIn = Date.now() + newToken['expires_in'] * 1000 - timeSpent;
		this.refreshToken = newToken['refresh_token'];
		this.refreshTokenExpiresIn = Date.now() + newToken['refresh_token_expires_in'] * 1000 - timeSpent;
		this.scope = newToken['scope'].split(' ');
		this.ownerId = newToken['owner_id'];
		this.endpointId = newToken['endpoint_id'];
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
    /**
     *  format: {phone-number}*{extension-number}
     */
	owner: string;

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