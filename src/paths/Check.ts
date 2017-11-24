/* Generated code */
import AuthProfileCheckResource from '../definitions/AuthProfileCheckResource';
import PathSegment from '../PathSegment';

export default class Check extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('check', id, prv, service);
	}

	get(query?: GetQuery): Promise<AuthProfileCheckResource> {
		return this.getRest().call(this.getEndpoint(true), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface GetQuery {

	permissionId?: string;

	targetExtensionId?: string;
}
