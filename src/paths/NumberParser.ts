/* Generated code */
import PathSegment from '../PathSegment';
import Parse from './Parse';
import PhonedataXml from './PhonedataXml';

export default class NumberParser extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('number-parser', id, prv, service);
	}

	phonedataXml(id?: string) {
		return new PhonedataXml(this, id);
	}

	parse(id?: string) {
		return new Parse(this, id);
	}
}
