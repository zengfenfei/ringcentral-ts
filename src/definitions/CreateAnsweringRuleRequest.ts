/* Generated code */
import CallersInfoRequest from './CallersInfoRequest';
import ForwardingInfoCreateRuleRequest from './ForwardingInfoCreateRuleRequest';

interface CreateAnsweringRuleRequest {

	/**
	 * Type of an answering rule. The 'Custom' value should be specified
	 */
	type?: string;

	/**
	 * Name of an answering rule specified by user
	 */
	name?: string;

	/**
	 * Answering rule will be applied when calls are received from the specified caller(s)
	 */
	callers?: CallersInfoRequest[];

	/**
	 * Forwarding parameters. Should be specified if the 'callHandlingAction' parameter value is set to 'ForwardCalls'. These settings determine the forwarding numbers to which the call should be forwarded
	 */
	forwarding?: ForwardingInfoCreateRuleRequest;
}

export default CreateAnsweringRuleRequest;
