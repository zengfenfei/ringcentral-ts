/* Generated code */
import FullCountryInfo from '../definitions/FullCountryInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Country extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('country', id, prv, service);
	}

	/**
	 *  Get Country List
	 */
	list(query?: ListQuery): Promise<PagingResult<FullCountryInfo>> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Get Country by ID
	 */
	get(): Promise<FullCountryInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface ListQuery {

	/**
	 * Specifies whether login with the phone numbers of this country is enabled or not
	 */
	loginAllowed?: boolean;

	/**
	 * Specifies if RingCentral sells phone numbers of this country
	 */
	numberSelling?: boolean;

	/**
	 * Indicates the page number to retrieve. Only positive number values are allowed. Default value is '1'
	 */
	page?: number;

	/**
	 * Indicates the page size (number of items). If not specified, the value is '100' by default
	 */
	perPage?: number;
}
