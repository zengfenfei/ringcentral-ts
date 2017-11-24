/* Generated code */
import MeetingRequestResource from '../definitions/MeetingRequestResource';
import MeetingResponseResource from '../definitions/MeetingResponseResource';
import PathSegment from '../PathSegment';
import End from './End';
import ServiceInfo from './ServiceInfo';

export default class Meeting extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('meeting', id, prv, service);
	}

	end(id?: string) {
		return new End(this, id);
	}

	serviceInfo(id?: string) {
		return new ServiceInfo(this, id);
	}

	list(): Promise<MeetingsResource> {
		return this.getRest().call(this.getEndpoint(false), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	post(body: MeetingRequestResource): Promise<void> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then(res => {});
	}


	get(): Promise<MeetingResponseResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	put(body: MeetingRequestResource): Promise<MeetingResponseResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then<any>((res) => {
				return res.json();
		});
	}


	delete(): Promise<void> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'delete'
		}).then(res => {});
	}

}
