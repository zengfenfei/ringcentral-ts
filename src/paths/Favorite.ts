/* Generated code */
import FavoriteCollection from '../definitions/FavoriteCollection';
import PathSegment from '../PathSegment';

export default class Favorite extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('favorite', id, prv, service);
	}

	get(): Promise<void> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then(res => {});
	}


	put(body: FavoriteCollection): Promise<void> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then(res => {});
	}

}
