/* Generated code */
import IAddressBookSync from '../definitions/AddressBookSync';
import PathSegment from '../PathSegment';

export default class AddressBookSync extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('address-book-sync', id, prv, service);
	}

	/**
	 * Permission: ReadContacts
	 * Usage Plan Group: Heavy
	 */
	list(query?: ListQuery): Promise<IAddressBookSync> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}

}

export interface ListQuery {

	/**
	 * Type of synchronization. The default value is 'FSync'
	 */
	syncType?: ('FSync' | 'ISync')[];

	/**
	 * Value of syncToken property of the last sync request response
	 */
	syncToken?: string;

	/**
	 * Number of records per page to be returned. 
	 * The max number of records is 250, which is also the default. 
	 * For FSync ??? if the number of records exceeds the parameter value (either specified or default), 
	 * all of the pages can be retrieved in several requests. 
	 * For ISync ??? if the number of records exceeds the page size, 
	 * the number of incoming changes to this number is limited
	 */
	perPage?: number;

	/**
	 * Internal identifier of a page. It can be obtained from the 'nextPageId' parameter passed in response body
	 */
	pageId?: number;
}
