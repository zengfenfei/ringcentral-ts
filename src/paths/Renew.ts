/* Generated code */
import SubscriptionInfo from '../definitions/SubscriptionInfo';
import PathSegment from '../PathSegment';

export default class Renew extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('renew', id, prv, service);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.26 (Release 8.12)</p><p>Renews an existent subscription by ID by posting request with an empty body..</p><h4>Usage Plan Group</h4><p>Medium</p>
	 */
	post(): Promise<SubscriptionInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}

}
