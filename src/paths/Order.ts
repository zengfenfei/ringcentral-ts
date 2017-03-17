/* Generated code */
import DeviceInfo from '../definitions/DeviceInfo';
import PathSegment from '../PathSegment';

export default class Order extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('order', id, prv, service);
	}

	/**
	 *  Create New Order
	 */
	post(body: PostBody): Promise<PostResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  Get Order by ID
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

export interface PostBody {

	/**
	 * List of devices to order
	 */
	devices?: DeviceInfo[];
}

export interface PostResponse {

	/**
	 * List of the ordered devices
	 */
	devices?: DeviceInfo[];
}

export interface GetResponse {

	/**
	 * Identifier of a device
	 */
	id?: string;

	/**
	 * Canonical URI of an order resource
	 */
	uri?: string;

	/**
	 * List of the ordered devices
	 */
	devices?: DeviceInfo[];
}
