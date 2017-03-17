/* Generated code */
import GroupInfo from '../definitions/GroupInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Group extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('group', id, prv, service);
	}

	/**
	 *  Get Contact Group List
	 */
	list(): Promise<PagingResult<GroupInfo>> {
		return this.getRest().call(this.getEndpoint(false), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
