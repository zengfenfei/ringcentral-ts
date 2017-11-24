/* Generated code */
import PathSegment from '../PathSegment';
import BulkAssign from './BulkAssign';
import Users from './Users';

export default class ParkLocations extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('park-locations', id, prv, service);
	}

	users(id?: string) {
		return new Users(this, id);
	}

	bulkAssign(id?: string) {
		return new BulkAssign(this, id);
	}
}
