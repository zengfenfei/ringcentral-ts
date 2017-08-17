/* Generated code */
import GlipGroupInfo from '../definitions/GlipGroupInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';
import BulkAssign from './BulkAssign';

export default class Groups extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('groups', id, prv, service);
	}

	bulkAssign(id?: string) {
		return new BulkAssign(this, id);
	}

	/**
	 *  Create Group
	 */
	post(body: PostBody): Promise<GlipGroupInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Get Group List
	 */
	list(query?: ListQuery): Promise<PagingResult<GlipGroupInfo>> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Get Group by ID
	 */
	get(): Promise<GlipGroupInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface PostBody {

	/**
	 * Type of a group to be created. 'PrivateChat' is a group of 2 members. 'Team' is a chat of 1 and more participants, the membership can be modified in future
	 */
	type?: 'PrivateChat' | 'Team';

	/**
	 * For 'Team' group type only. Team access level
	 */
	isPublic?: boolean;

	/**
	 * For 'Team' group type only. Team name
	 */
	name?: string;

	/**
	 * For 'Team' group type only. Team description
	 */
	description?: string;

	/**
	 * Identifier(s) of group members. For 'PrivateChat' group type 2 members only are supported
	 */
	members?: string[];
}

export interface ListQuery {

	/**
	 * Type of a group. 'PrivateChat' is a group of 2 members. 'Group' is a chat of 2 and more participants, the membership cannot be changed after group creation. 'Team' is a chat of 1 and more participants, the membership can be modified in future
	 */
	type?: 'PrivateChat' | 'Group' | 'Team';

	/**
	 * Token of a page to be returned, see Glip Navigation Info
	 */
	pageToken?: string;

	/**
	 * Max numbers of records to be returned. The default/maximum value is 250
	 */
	recordCount?: number;
}
