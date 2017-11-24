/* Generated code */
import PathSegment from '../PathSegment';
import Banners from './Banners';
import CustomData from './CustomData';
import SipProvision from './SipProvision';
import SpecialNumberRule from './SpecialNumberRule';

export default class ClientInfo extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('client-info', id, prv, service);
	}

	sipProvision(id?: string) {
		return new SipProvision(this, id);
	}

	banners(id?: string) {
		return new Banners(this, id);
	}

	customData(id?: string) {
		return new CustomData(this, id);
	}

	specialNumberRule(id?: string) {
		return new SpecialNumberRule(this, id);
	}
}
