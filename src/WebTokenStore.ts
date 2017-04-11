import Token, { TokenStore } from './Token';

/**
 * Store token in localStorage or sessionStorage
 */
export default class WebTokenStore implements TokenStore {
	key: string;
	store: Storage;
	token = new Token();

	constructor(key: string, store: Storage) {
		this.key = key;
		this.store = store;
	}

	async save(data: Token) {
		this.store[this.key] = JSON.stringify(data);
	}

	async get() {
		let data = localStorage[this.key];
		if (data) {
			return this.token.fromCache(JSON.parse(data));
		}
	}

	async clear() {
		this.store.removeItem(this.key);
	}

}