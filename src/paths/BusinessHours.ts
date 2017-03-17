/* Generated code */
import BusinessHourScheduleInfo from '../definitions/BusinessHourScheduleInfo';
import PathSegment from '../PathSegment';

export default class BusinessHours extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('business-hours', id, prv, service);
	}

	/**
	 *  Get User Hours Setting
	 */
	get(): Promise<GetResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface GetResponse {

	/**
	 * Canonical URI of a business-hours resource
	 */
	uri?: string;

	/**
	 * Schedule when an answering rule is applied
	 */
	schedule?: BusinessHourScheduleInfo;
}
