/* Generated code */
import CallLogCallerInfo from './CallLogCallerInfo';
import RecordingInfo from './RecordingInfo';

interface UserCallLogRecord {

	/**
	 * Internal identifier of a cal log record
	 */
	id?: string;

	/**
	 * Canonical URI of a call log record
	 */
	uri?: string;

	/**
	 * Internal identifier of a call session
	 */
	sessionId?: string;

	/**
	 * Caller information
	 */
	from?: CallLogCallerInfo;

	/**
	 * Callee information
	 */
	to?: CallLogCallerInfo;

	/**
	 * Call type = ['Voice', 'Fax']
	 */
	type?: 'Voice' | 'Fax';

	/**
	 * Call direction = ['Inbound', 'Outbound']
	 */
	direction?: 'Inbound' | 'Outbound';

	/**
	 * The call start datetime in ISO 8601 format including timezone, for example 2016-03-10T18:07:52.534Z
	 */
	startTime?: string;

	/**
	 * Call duration in seconds
	 */
	duration?: number;

	/**
	 * Call recording data. Returned if the call is recorded. Each call recording is stored in the system for 90 days. But if the number of recordings exceeds the admissible limit (100,000 recordings per account) then the older recordings are replaced with the new ones. Thus a link to an older recording in a certain call log record becomes unavailable
	 */
	recording?: RecordingInfo;
}

export default UserCallLogRecord;
