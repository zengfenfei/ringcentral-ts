import Token from './Token';
import { expect } from 'chai';

describe('Token', () => {

	it('validates owner of token after restored', () => {
		let t = new Token();
		t.setOwner('aaa', { username: 'ccc', extension: 'dddd' });
		expect(() => t.validateOwner('bbb')).to.throw();
		expect(() => t.validateOwner('aaa', { username: 'ccc' })).to.throw();
	});

	it('restores token from serialized data', () => {
		let t = new Token();
		t.fromCache({ appKey: 'theKey' });
	});

});