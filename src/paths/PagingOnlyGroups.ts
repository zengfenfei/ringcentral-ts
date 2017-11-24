/* Generated code */
import PathSegment from '../PathSegment';
import BulkAssign from './BulkAssign';
import Devices from './Devices';
import Users from './Users';

export default class PagingOnlyGroups extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('paging-only-groups', id, prv, service);
	}

	users(id?: string) {
		return new Users(this, id);
	}

	devices(id?: string) {
		return new Devices(this, id);
	}

	bulkAssign(id?: string) {
		return new BulkAssign(this, id);
	}
}
