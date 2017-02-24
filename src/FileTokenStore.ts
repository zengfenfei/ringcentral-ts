import Token, { TokenStore } from './Token';
import * as fs from 'fs-promise';

export default class FileTokenStore implements TokenStore {
    file: string;
    token: Token;

    constructor(file: string) {
        this.file = file;
    }

    async restore(): Promise<void> {
        let data = await fs.readFile(this.file);
        this.token = new Token(JSON.parse(data.toString()));
    }

    save(data: Token) {
        this.token = data;
        return fs.writeFileSync(this.file, JSON.stringify(data));
    }

    get(): Token {
        return this.token;
    }

    clear() {
        return fs.unlink(this.file);
    }
}