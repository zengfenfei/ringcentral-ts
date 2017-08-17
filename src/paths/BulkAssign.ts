/* Generated code */
import GlipGroupInfo from '../definitions/GlipGroupInfo';
import PathSegment from '../PathSegment';

export default class BulkAssign extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('bulk-assign', id, prv, service);
	}

	/**
	 *  Edit Group Members
	 */
	post(body: PostBody): Promise<GlipGroupInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface PostBody {

	/**
	 * List of users to be added to the team
	 */
	addedPersonIds?: string[];

	/**
	 * List of user email addresses to be added to the team (i.e. as guests)
	 */
	addedPersonEmails?: string[];

	/**
	 * List of users to be removed from the team
	 */
	removedPersonIds?: string[];
}
