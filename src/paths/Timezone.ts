/* Generated code */
import TimezoneInfo from '../definitions/TimezoneInfo';
import PagingResult from '../PagingResult';
import PathSegment from '../PathSegment';

export default class Timezone extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('timezone', id, prv, service);
	}

	/**
	 *  Get Time Zone List
	 */
	list(query?: ListQuery): Promise<PagingResult<TimezoneInfo>> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Get Time Zone by ID
	 */
	get(): Promise<TimezoneInfo> {
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
	 * Indicates the page number to retrieve. Only positive number values are allowed. Default value is '1'
	 */
	page?: string;

	/**
	 * Indicates the page size (number of items). If not specified, the value is '100' by default
	 */
	perPage?: string;
}
