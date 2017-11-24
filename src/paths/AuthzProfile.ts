/* Generated code */
import AuthProfileResource from '../definitions/AuthProfileResource';
import PathSegment from '../PathSegment';
import Check from './Check';

export default class AuthzProfile extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('authz-profile', id, prv, service);
	}

	check(id?: string) {
		return new Check(this, id);
	}

	get(): Promise<AuthProfileResource> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
