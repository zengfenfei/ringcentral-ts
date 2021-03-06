/* Generated code */
import GetExtensionGrantListResponse from '../definitions/GetExtensionGrantListResponse';
import PathSegment from '../PathSegment';

export default class Grant extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('grant', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'></p><p>Returns the list of extension grants.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Light</p>
	 */
	list(query?: ListQuery): Promise<GetExtensionGrantListResponse> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface ListQuery {

	/**
	 * Indicates the page number to retrieve. Only positive number values are allowed. Default value is '1'
	 */
	page?: number;

	/**
	 * Indicates the page size (number of items). If not specified, the value is '100' by default
	 */
	perPage?: number;
}
