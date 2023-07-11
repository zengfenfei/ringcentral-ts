/* Generated code */

interface NumberPoolPhoneNumberRequest {

	/**
	 * Phone number in E.164 format
	 */
	phoneNumber?: string;

	/**
	 * Datetime up to which the number is reserved in ISO 8601 format including timezone, 
	 * for example 2016-03-10T18:07:52.534Z. If it is omitted or explicitly set to 'null', 
	 * the number will be un-reserved if it was reserved previously by the same session.
	 * Also the values 'Min' and 'Max' are supported. 
	 * 'Min' is 30 seconds; and 'Max' is 30 days (for reservation by brand) and 20 minutes (for reservation by account/session)
	 */
	reservedTill?: string;

	/**
	 * Internal identifier of a phone number reservation; encoded data including reservation type (by brand, by account, by session), 
	 * particular brand/account/session data, and reservation date and time
	 */
	reservationId?: string;
}

export default NumberPoolPhoneNumberRequest;
