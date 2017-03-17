/* Generated code */
import BusinessAddressInfo from '../definitions/BusinessAddressInfo';
import PathSegment from '../PathSegment';

export default class BusinessAddress extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('business-address', id, prv, service);
	}

	/**
	 *  Get Company Business Address
	 */
	get(): Promise<GetResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Update Company Business Address
	 */
	put(body: PutBody): Promise<PutResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface GetResponse {

	/**
	 * Canonical URI of the business address resource
	 */
	uri?: string;

	/**
	 * Company business name
	 */
	company?: string;

	/**
	 * Company business email address
	 */
	email?: string;

	/**
	 * Company business address
	 */
	businessAddress?: BusinessAddressInfo;
}

export interface PutBody {

	/**
	 * Company business name
	 */
	company?: string;

	/**
	 * Company business email address
	 */
	email?: string;

	/**
	 * Company business address
	 */
	businessAddress?: BusinessAddressInfo;
}

export interface PutResponse {

	/**
	 * Canonical URI of the business address resource
	 */
	uri?: string;

	/**
	 * Company business name
	 */
	company?: string;

	/**
	 * Company business email address
	 */
	email?: string;

	/**
	 * Company business address
	 */
	businessAddress?: BusinessAddressInfo;
}
