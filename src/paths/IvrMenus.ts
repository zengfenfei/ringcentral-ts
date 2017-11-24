/* Generated code */
import IVRMenuInfo from '../definitions/IVRMenuInfo';
import PathSegment from '../PathSegment';

export default class IvrMenus extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('ivr-menus', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.32 (Release 9.3)</p><p>Returns a company IVR menu by ID</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>API Group</h4><p>Medium</p>
	 */
	get(): Promise<IVRMenuInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
