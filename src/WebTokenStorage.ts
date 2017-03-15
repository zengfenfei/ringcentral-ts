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

    save(data: Token) {
        this.store[this.key] = JSON.stringify(data);
    }

    get(): Token {
        let data = localStorage[this.key];
        if (data) {
            return this.token.fromCache(JSON.parse(data));
        }
    }

    clear() {
        this.store.removeItem(this.key);
    }

    async restore() {
        return this.get();
    }
}