import Token, { TokenStore } from './Token';
import * as fs from 'fs';

export default class FileTokenStore implements TokenStore {
    file: string;
    token = new Token();

    constructor(file: string) {
        this.file = file;
    }

    async restore() {
        let json = fs.readFileSync(this.file);
        let data = JSON.parse(json.toString());
        this.token.fromCache(data);
        return this.token;
    }

    save(data: Token) {
        this.token = data;
        fs.writeFileSync(this.file, JSON.stringify(data));
    }

    get(): Token {
        if (!this.token.accessToken) {
            return null;
        }
        return this.token;
    }

    clear() {
        this.token = null;
        fs.unlinkSync(this.file);
    }
}