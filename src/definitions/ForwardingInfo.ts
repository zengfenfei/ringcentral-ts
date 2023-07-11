/* Generated code */
import RuleInfo from './RuleInfo';

interface ForwardingInfo {

	/**
	 * Specifies if the user's softphone(s) are notified before forwarding the incoming call to desk phones and forwarding numbers
	 */
	notifyMySoftPhones?: boolean;

	/**
	 * Specifies if the administrator's softphone is notified before forwarding the incoming call to desk phones and forwarding numbers. The default value is 'False'
	 */
	notifyAdminSoftPhones?: boolean;

	/**
	 * Number of rings before forwarding starts
	 */
	softPhonesRingCount?: number;

	/**
	 * Specifies the order in which forwarding numbers ring. 'Sequentially' means that forwarding numbers are ringing one at a time, in order of priority. 
	 * 'Simultaneously' means that forwarding numbers are ring all at the same time.
	 */
	ringingMode?: 'Sequentially' | 'Simultaneously';

	/**
	 * Information on a call forwarding rule
	 */
	rules?: RuleInfo[];
}

export default ForwardingInfo;
