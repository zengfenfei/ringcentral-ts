/* Generated code */
import PathSegment from '../PathSegment';
import Brand from './Brand';
import Country from './Country';
import Device from './Device';
import FaxCoverPage from './FaxCoverPage';
import Greeting from './Greeting';
import Language from './Language';
import LicenseTypes from './LicenseTypes';
import Location from './Location';
import Permission from './Permission';
import PermissionCategory from './PermissionCategory';
import SecretQuestion from './SecretQuestion';
import ServicePlan from './ServicePlan';
import ShippingOptions from './ShippingOptions';
import State from './State';
import Timezone from './Timezone';
import UserRole from './UserRole';

export default class Dictionary extends PathSegment {
	constructor(prv: PathSegment, id?: string, service?) {
		super('dictionary', id, prv, service);
	}

	faxCoverPage(id?: string) {
		return new FaxCoverPage(this, id);
	}

	userRole(id?: string) {
		return new UserRole(this, id);
	}

	permission(id?: string) {
		return new Permission(this, id);
	}

	permissionCategory(id?: string) {
		return new PermissionCategory(this, id);
	}

	greeting(id?: string) {
		return new Greeting(this, id);
	}

/**
	 * Internal identifier of a question
	 */	secretQuestion(id?: string) {
		return new SecretQuestion(this, id);
	}

/**
	 * Internal identifier of a language
	 */	language(id?: string) {
		return new Language(this, id);
	}

/**
	 * Internal identifier of a country
	 */	country(id?: string) {
		return new Country(this, id);
	}

	location(id?: string) {
		return new Location(this, id);
	}

/**
	 * Internal identifier of a state
	 */	state(id?: string) {
		return new State(this, id);
	}

/**
	 * Internal identifier of a timezone
	 */	timezone(id?: string) {
		return new Timezone(this, id);
	}

	brand(id?: string) {
		return new Brand(this, id);
	}

	servicePlan(id?: string) {
		return new ServicePlan(this, id);
	}

	device(id?: string) {
		return new Device(this, id);
	}

	shippingOptions(id?: string) {
		return new ShippingOptions(this, id);
	}

	licenseTypes(id?: string) {
		return new LicenseTypes(this, id);
	}
}
