/* Generated code */
import AccountDeviceUpdate from '../definitions/AccountDeviceUpdate';
import DeviceResource from '../definitions/DeviceResource';
import GetAccountDevicesResponse from '../definitions/GetAccountDevicesResponse';
import GetDeviceInfoResponse from '../definitions/GetDeviceInfoResponse';
import PathSegment from '../PathSegment';

export default class Device extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('device', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.12 (Release 6.4)</p><p>Returns all the devices for a particular extension.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Light</p>
	 */
	list(): Promise<GetAccountDevicesResponse> {
		return this.getRest().call(this.getEndpoint(false), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'>Since 1.0.9 (Release 6.1)</p><p>Returns account device(s) by their ID(s).</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Light</p>
	 */
	get(): Promise<GetDeviceInfoResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	put(body: AccountDeviceUpdate): Promise<DeviceResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
