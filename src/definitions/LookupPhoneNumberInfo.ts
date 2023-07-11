/* Generated code */

interface LookupPhoneNumberInfo {

	/**
	 * Phone number in E.164 format
	 */
	phoneNumber?: string;

	/**
	 * Phone number formatted according to current brand's default country
	 */
	formattedNumber?: string;

	/**
	 * Vanity pattern for this number. Returned only when vanity search option is requested. 
	 * Vanity pattern corresponds to request parameters nxx plus line or numberPattern
	 */
	vanityPattern?: string;

	/**
	 * The value is returned if the extendedSearch parameter is true. The values are 10, 9, 8, etc.; '10' is the closest match
	 */
	rank?: number;
}

export default LookupPhoneNumberInfo;
