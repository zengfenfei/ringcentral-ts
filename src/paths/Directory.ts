/* Generated code */
import PathSegment from '../PathSegment';
import Contacts from './Contacts';
import ExtensionNumbers from './ExtensionNumbers';
import Federation from './Federation';
import FederationConflicts from './FederationConflicts';

export default class Directory extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('directory', id, prv, service);
	}

/**
	 * Internal identifier of an extension
	 */	contacts(id?: string) {
		return new Contacts(this, id);
	}

	federation(id?: string) {
		return new Federation(this, id);
	}

	federationConflicts(id?: string) {
		return new FederationConflicts(this, id);
	}

	extensionNumbers(id?: string) {
		return new ExtensionNumbers(this, id);
	}
}
