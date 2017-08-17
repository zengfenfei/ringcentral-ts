import MessageInfo from '../definitions/MessageInfo';
import Base, { ListQuery } from './MessageSyncBase';

export default class MessageSync extends Base {

	/**
	 *  Message Synchronization
	 */
	list(query?: ListQuery): Promise<MessageSyncRes> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
			return res.json();
		});
	}

}

export interface MessageSyncRes {
	records?: MessageInfo[];

	syncInfo?: SyncInfo;
}

export interface SyncInfo {
	/**
	 * Type of synchronization
	 */
	syncType?: 'FSync' | 'ISync';

	/**
	 * Synchronization token
	 */
	syncToken: string;

	/**
	 * Last synchronization datetime in ISO 8601 format including timezone, for example 2016- 03 - 10T18:07:52.534Z
	 */
	syncTime: string;

	/**
	 * Returned if 'recordCount' is specified. 'True' means that there are some earlier messages not yet retrieved.To retrieve all the messages please repeat either 'ISync' request, or 'FSync' request without 'recordCount' value. 'False' means that all records are returned
	 */
	olderRecordsExist: boolean;
}
