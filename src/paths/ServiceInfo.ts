/* Generated code */
import MeetingServiceInfoResource from '../definitions/MeetingServiceInfoResource';
import PathSegment from '../PathSegment';

export default class ServiceInfo extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('service-info', id, prv, service);
	}

	get(): Promise<MeetingServiceInfoResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
