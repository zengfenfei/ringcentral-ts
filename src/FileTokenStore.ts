import Token, { TokenStore } from './Token';
import * as fs from 'fs';

export default class FileTokenStore implements TokenStore {
	file: string;
	token: Token;

	constructor(file: string) {
		this.file = file;
	}

	async save(data: Token) {
		this.token = data;
		fs.writeFileSync(this.file, JSON.stringify(data));
	}

	async get() {
		if (!this.token) {
			let json = fs.readFileSync(this.file);
			let data = JSON.parse(json.toString());
			this.token = new Token();
			this.token.fromCache(data);
		}
		return this.token;
	}

	async clear() {
		this.token = null;
		fs.unlinkSync(this.file);
	}
}