/* Generated code */
import AccountBusinessAddressResource from '../definitions/AccountBusinessAddressResource';
import GetAccountInfoResponse from '../definitions/GetAccountInfoResponse';
import ModifyAccountBusinessAddressRequest from '../definitions/ModifyAccountBusinessAddressRequest';
import PathSegment from '../PathSegment';

export default class BusinessAddress extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('business-address', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'></p><p></p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Light</p>
	 */
	get(): Promise<GetAccountInfoResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'></p><p></p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>EditAccounts</td><td>Viewing and updating user account info (including name, business name, address and phone number/account number)</td></tr><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Medium</p>
	 */
	put(body: ModifyAccountBusinessAddressRequest): Promise<AccountBusinessAddressResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
