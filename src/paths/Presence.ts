/* Generated code */
import AccountPresenceInfo from '../definitions/AccountPresenceInfo';
import GetPresenceInfo from '../definitions/GetPresenceInfo';
import PresenceInfoResource from '../definitions/PresenceInfoResource';
import PathSegment from '../PathSegment';

export default class Presence extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('presence', id, prv, service);
	}

	list(): Promise<AccountPresenceInfo> {
		return this.getRest().call(this.getEndpoint(false), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'>Since 1.0.2</p><p>Returns presence status of an extension or several extensions by their ID(s). Batch request is supported, see Batch Requests for details.The presenceStatus is returned as Offline (the parameters telephonyStatus, message, userStatus and dndStatus are not returned at all) for the following extension types: Department/Announcement Only/Take Messages Only (Voicemail)/Fax User/Paging Only Group/Shared Lines Group/IVR Menu/Application Extension/Park Location.If the user requests his/her own presence status, the response contains actual presence status even if the status publication is turned off.Batch request is supported. For batch requests the number of extensions in one request is limited to 30. If more extensions are included in the request, the error code 400 Bad Request is returned with the logical error code InvalidMultipartRequest and the corresponding message 'Extension Presence Info multipart request is limited to 30 extensions'.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadPresence</td><td>Getting user presence information</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Light</p>
	 */
	get(): Promise<GetPresenceInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	put(body: PresenceInfoResource): Promise<PresenceInfoResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
