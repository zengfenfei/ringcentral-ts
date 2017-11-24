/* Generated code */
import ExtensionCreationRequest from '../definitions/ExtensionCreationRequest';
import ExtensionInfo from '../definitions/ExtensionInfo';
import ExtensionUpdateRequest from '../definitions/ExtensionUpdateRequest';
import GetExtensionInfoResponse from '../definitions/GetExtensionInfoResponse';
import PathSegment from '../PathSegment';
import ActiveCalls from './ActiveCalls';
import AddressBook from './AddressBook';
import AddressBookSync from './AddressBookSync';
import AnsweringRule from './AnsweringRule';
import AuthzProfile from './AuthzProfile';
import BlockedNumber from './BlockedNumber';
import BusinessHours from './BusinessHours';
import CallerId from './CallerId';
import CallLog from './CallLog';
import CallLogSync from './CallLogSync';
import CompanyPager from './CompanyPager';
import Conferencing from './Conferencing';
import Credentials from './Credentials';
import Device from './Device';
import DirectRingOut from './DirectRingOut';
import Favorite from './Favorite';
import Fax from './Fax';
import ForwardingNumber from './ForwardingNumber';
import FreeNumbers from './FreeNumbers';
import Grant from './Grant';
import Greeting from './Greeting';
import Meeting from './Meeting';
import MessageStore from './MessageStore';
import MessageSync from './MessageSync';
import NotificationSettings from './NotificationSettings';
import PhoneNumber from './PhoneNumber';
import Presence from './Presence';
import ProfileImage from './ProfileImage';
import Reporting from './Reporting';
import Ringout from './Ringout';
import RingOut from './RingOut';
import Sms from './Sms';

export default class Extension extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('extension', id || '~', prv, service);
	}

/**
	 * Internal identifier of a call log record
	 */	callLog(id?: string) {
		return new CallLog(this, id);
	}

	callLogSync(id?: string) {
		return new CallLogSync(this, id);
	}

	activeCalls(id?: string) {
		return new ActiveCalls(this, id);
	}

	phoneNumber(id?: string) {
		return new PhoneNumber(this, id);
	}

	sms(id?: string) {
		return new Sms(this, id);
	}

	companyPager(id?: string) {
		return new CompanyPager(this, id);
	}

	fax(id?: string) {
		return new Fax(this, id);
	}

/**
	 * Internal identifier of a message
	 */	messageStore(id?: string) {
		return new MessageStore(this, id);
	}

	messageSync(id?: string) {
		return new MessageSync(this, id);
	}

/**
	 * Internal identifier of a RingOut call
	 */	ringout(id?: string) {
		return new Ringout(this, id);
	}

/**
	 * Internal identifier of a RingOut call
	 */	ringOut(id?: string) {
		return new RingOut(this, id);
	}

	directRingOut(id?: string) {
		return new DirectRingOut(this, id);
	}

	addressBook(id?: string) {
		return new AddressBook(this, id);
	}

	addressBookSync(id?: string) {
		return new AddressBookSync(this, id);
	}

	favorite(id?: string) {
		return new Favorite(this, id);
	}

	presence(id?: string) {
		return new Presence(this, id);
	}

	meeting(id?: string) {
		return new Meeting(this, id);
	}

	authzProfile(id?: string) {
		return new AuthzProfile(this, id);
	}

/**
	 * Internal identifier of a forwarding number
	 */	forwardingNumber(id?: string) {
		return new ForwardingNumber(this, id);
	}

/**
	 * Internal identifiers of a blocked number list entry
	 */	blockedNumber(id?: string) {
		return new BlockedNumber(this, id);
	}

	businessHours(id?: string) {
		return new BusinessHours(this, id);
	}

/**
	 * Internal identifier of an answering rule. The value can be standard digital ID or specific ID - either business-hours-rule or after-hours-rule
	 */	answeringRule(id?: string) {
		return new AnsweringRule(this, id);
	}

	greeting(id?: string) {
		return new Greeting(this, id);
	}

	callerId(id?: string) {
		return new CallerId(this, id);
	}

	credentials(id?: string) {
		return new Credentials(this, id);
	}

	grant(id?: string) {
		return new Grant(this, id);
	}

	notificationSettings(id?: string) {
		return new NotificationSettings(this, id);
	}

/**
	 * Dimensions of a profile image which will be returned in response. If this path parameter is not specified in request URI then
	 */	profileImage(id?: string) {
		return new ProfileImage(this, id);
	}

	conferencing(id?: string) {
		return new Conferencing(this, id);
	}

	freeNumbers(id?: string) {
		return new FreeNumbers(this, id);
	}

	device(id?: string) {
		return new Device(this, id);
	}

	reporting(id?: string) {
		return new Reporting(this, id);
	}

	/**
	 *  <p style='font-style:italic;'>Since 1.0.0</p><p>Returns the list of extensions created for a particular account. All types of extensions are included in this list.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>API Group</h4><p>Medium</p>
	 */
	list(query?: ListQuery): Promise<GetExtensionListResponse> {
		return this.getRest().call(this.getEndpoint(false), query, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'>Since 1.0.10 (Release 6.2)</p><p>Creates an extension.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>EditAccounts</td><td>Viewing and updating user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>API Group</h4><p>Medium</p>
	 */
	post(body: ExtensionCreationRequest): Promise<ExtensionInfo> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'post'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'>Since 1.0.0</p><p>Returns basic information about a particular extension of an account.</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>ReadAccounts</td><td>Viewing user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Light</p>
	 */
	get(): Promise<GetExtensionInfoResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'get'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'></p><p></p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>EditExtensions</td><td>Viewing and updating my extension info (includes extension name, number, email and phone number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Medium</p>
	 */
	put(body: ExtensionUpdateRequest): Promise<GetExtensionInfoResponse> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: body,
			method: 'put'
		}).then<any>((res) => {
				return res.json();
		});
	}


	/**
	 *  <p style='font-style:italic;'>Since 1.0.10 (Release 6.2)</p><p>Deletes extension(s) by ID(s).</p><h4>Required Permissions</h4><table class='fullwidth'><thead><tr><th>Permission</th><th>Description</th></tr></thead><tbody><tr><td class='code'>EditAccounts</td><td>Viewing and updating user account info (including name, business name, address and phone number/account number)</td></tr></tbody></table><h4>Usage Plan Group</h4><p>Medium</p>
	 */
	delete(): Promise<void> {
		return this.getRest().call(this.getEndpoint(true), undefined, {
			body: undefined,
			method: 'delete'
		}).then(res => {});
	}

}

export interface ListQuery {

	/**
	 * Indicates the page number to retrieve. Only positive number values are allowed. Default value is '1'
	 */
	page?: number;

	/**
	 * Indicates the page size (number of items). If not specified, the value is '100' by default.
	 */
	perPage?: number;

	/**
	 * Extension current state. Multiple values are supported. If 'Unassigned' is specified, then extensions without extensionNumber are returned. If not specified, then all extensions are returned
	 */
	status?: ('Enabled' | 'Disabled' | 'NotActivated' | 'Unassigned')[];

	/**
	 * Extension type. Multiple values are supported
	 */
	type?: ('User' | 'FaxUser' | 'VirtualUser' | 'DigitalUser' | 'Department' | 'Announcement' | 'Voicemail' | 'SharedLinesGroup' | 'PagingOnly' | 'IvrMenu' | 'ApplicationExtension' | 'ParkLocation' | 'Limited' | 'Bot')[];
}
