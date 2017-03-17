// import { expect } from 'chai';
import auth from '../test/auth';
import Client from './Client';

let client: Client;
auth.then(c => client = c);

describe('client', () => {
	it('covers all', runCoverage);
});

function runCoverage() {
	client.clientInfo();
	client.numberPool();
}
