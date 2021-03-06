/* Generated code */
import CreateSipRegistrationRequest from '../definitions/CreateSipRegistrationRequest';
import CreateSipRegistrationResponse from '../definitions/CreateSipRegistrationResponse';
import PathSegment from '../PathSegment';

export default class SipProvision extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('sip-provision', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.16 (Release 7.1)</p><p>Creates SIP registration of a device/application (WebPhone, Mobile, softphone)</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>VoipCalling</td><td>Registering as VoIP device and making VoIP calls</td></tr></tbody></table><h4>API Group</h4><p>Heavy</p>
	 */
	post(body: CreateSipRegistrationRequest): Promise<CreateSipRegistrationResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
