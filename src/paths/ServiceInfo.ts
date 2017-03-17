/* Generated code */
import MeetingServiceInfo from '../definitions/MeetingServiceInfo';
import PathSegment from '../PathSegment';

export default class ServiceInfo extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('service-info', id, prv, service);
	}

	/**
	 *  Get Meeting Service Info
	 */
	get(): Promise<MeetingServiceInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
