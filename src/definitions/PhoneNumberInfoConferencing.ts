/* Generated code */
import GetCountryInfoConferencing from './GetCountryInfoConferencing';

interface PhoneNumberInfoConferencing {

	/**
	 * Information on a home country of a conference phone number
	 */
	country?: GetCountryInfoConferencing;

	/**
	 * 'True' if the number is default for the conference. 
	 * Default conference number is a domestic number that can be set by user (otherwise it is set by the system). 
	 * Only one default number per country is allowed
	 */
	default?: boolean;

	/**
	 * 'True' if the greeting message is played on this number
	 */
	hasGreeting?: boolean;

	/**
	 * Location (city, region, state) of a conference phone number
	 */
	location?: string;

	/**
	 * Dial-in phone number to connect to a conference
	 */
	phoneNumber?: string;
}

export default PhoneNumberInfoConferencing;
