/* Generated code */
import PathSegment from '../PathSegment';
import Settings from './Settings';

export default class Reporting extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('reporting', id, prv, service);
	}

	settings(id?: string) {
		return new Settings(this, id);
	}
}
