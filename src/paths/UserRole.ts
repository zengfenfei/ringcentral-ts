/* Generated code */
import PathSegment from '../PathSegment';
import Default from './Default';

export default class UserRole extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('user-role', id, prv, service);
	}

	default(id?: string) {
		return new Default(this, id);
	}
}
