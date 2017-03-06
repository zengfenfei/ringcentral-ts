import Token, { TokenStore } from './Token';
import * as fs from 'fs';

export default class FileTokenStore implements TokenStore {
    file: string;
    token: Token;

    constructor(file: string) {
        this.file = file;
    }

    async restore() {
        let data = fs.readFileSync(this.file);
        this.token = new Token(JSON.parse(data.toString()));
    }

    save(data: Token) {
        this.token = data;
        fs.writeFileSync(this.file, JSON.stringify(data));
    }

    get(): Token {
        return this.token;
    }

    clear() {
        this.token = null;
        fs.unlinkSync(this.file);
    }
}