/* Generated code */
import CompanyAnsweringRuleCalledNumberInfo from './CompanyAnsweringRuleCalledNumberInfo';
import CompanyAnsweringRuleCallersInfoRequest from './CompanyAnsweringRuleCallersInfoRequest';
import CompanyAnsweringRuleScheduleInfoRequest from './CompanyAnsweringRuleScheduleInfoRequest';
import GreetingInfo from './GreetingInfo';

interface CompanyAnsweringRuleRequest {

	/**
	 * Name of an answering rule specified by user. Max number of symbols is 30. The default value is 'My Rule N' where 'N' is the first free number
	 */
	name?: string;

	/**
	 * Specifies if the rule is active or inactive. The default value is 'True'
	 */
	enabled?: boolean;

	/**
	 * Type of an answering rule, the default value is 'Custom' = ['BusinessHours', 'AfterHours', 'Custom']
	 */
	type?: 'BusinessHours' | 'AfterHours' | 'Custom';

	/**
	 * Answering rule will be applied when calls are received from the specified caller(s)
	 */
	callers?: CompanyAnsweringRuleCallersInfoRequest[];

	/**
	 * Answering rule will be applied when calling the specified number(s)
	 */
	calledNumbers?: CompanyAnsweringRuleCalledNumberInfo[];

	/**
	 * Schedule when an answering rule should be applied
	 */
	schedule?: CompanyAnsweringRuleScheduleInfoRequest;

	/**
	 * Specifies how incoming calls are forwarded. The default value is 'Operator' 'Operator' - play company greeting and forward to operator extension 'Disconnect' - play company greeting and disconnect 'Bypass' - bypass greeting to go to selected extension = ['Operator', 'Disconnect', 'Bypass']
	 */
	callHandlingAction?: 'Operator' | 'Disconnect' | 'Bypass';

	/**
	 * Extension to which the call is forwarded in 'Bypass' mode
	 */
	extension?: CompanyAnsweringRuleCallersInfoRequest;

	/**
	 * Greetings applied for an answering rule; only predefined greetings can be applied, see Dictionary Greeting List
	 */
	greetings?: GreetingInfo[];
}

export default CompanyAnsweringRuleRequest;
