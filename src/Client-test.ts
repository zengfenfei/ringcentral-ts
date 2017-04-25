// import { expect } from 'chai';
import Client from './Client';

let client = new Client({ appKey: '', appSecret: '' });

describe('client', () => {
	it('covers all', runCoverage);
});

function runCoverage() {
	client.clientInfo();
	client.numberPool();
}
