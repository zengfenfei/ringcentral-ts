/* Generated code */

interface SyncInfoCallLog {

	/**
	 * Type of synchronization
	 */
	syncType?: 'FSync' | 'ISync';

	/**
	 * Synchronization token
	 */
	syncToken?: string;

	/**
	 * The last synchronization datetime in ISO 8601 format including timezone, 
	 * for example 2016-03-10T18:07:52.534Z
	 */
	syncTime?: string;
}

export default SyncInfoCallLog;
