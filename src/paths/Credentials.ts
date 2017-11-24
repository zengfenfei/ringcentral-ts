/* Generated code */
import PathSegment from '../PathSegment';
import Validate from './Validate';
import Verify from './Verify';

export default class Credentials extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('credentials', id, prv, service);
	}

	validate(id?: string) {
		return new Validate(this, id);
	}

	verify(id?: string) {
		return new Verify(this, id);
	}
}
