/* Generated code */
import GlipPostInfo from '../definitions/GlipPostInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Posts extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('posts', id, prv, service);
	}

	/**
	 *  Create Post
	 */
	post(body: PostBody): Promise<GlipPostInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Get Posts
	 */
	list(query?: ListQuery): Promise<PagingResult<GlipPostInfo>> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface PostBody {

	/**
	 * Internal identifier of a group to send post to
	 */
	groupId?: string;

	/**
	 * Text of a post, the maximum is 10000 characters
	 */
	text?: string;
}

export interface ListQuery {

	/**
	 * Identifier of a group to filter posts
	 */
	groupId?: string;

	/**
	 * Token of a page to be returned, see Glip Navigation Info
	 */
	pageToken?: string;

	/**
	 * Max numbers of records to be returned. The default/maximum value is 250
	 */
	recordCount?: number;
}
