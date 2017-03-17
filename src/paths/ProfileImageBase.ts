/* Generated code */
import PathSegment from '../PathSegment';

export default class ProfileImage extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('profile-image', id, prv, service);
	}

	/**
	 *  Get Profile Image
	 */
	get(): Promise<any> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		});
	}

}
