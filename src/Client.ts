import RestClient, { SERVER_PRODUCTION, SERVER_SANDBOX, API_VERSION, ClientOptions } from './RestClient';
import Account from './paths/Account';
import ClientInfo from './paths/ClientInfo';
import Dictionary from './paths/Dictionary';
import NumberParser from './paths/NumberParser';
import NumberPool from './paths/NumberPool';
import Subscription from './paths/Subscription';
import Subscription2 from './Subscription';

export default class RingCentral extends RestClient {

	constructor(opts: ClientOptions) {
		super(opts);
	}

	createSubscription(opts?: { debug?: boolean }) {
		return new Subscription2(this, opts);
	}


	account(id?: string): Account {
		return new Account(null, id, this);
	}

	clientInfo(id?: string): ClientInfo {
		return new ClientInfo(null, id, this);
	}

	dictionary(id?: string): Dictionary {
		return new Dictionary(null, id, this);
	}

	numberParser(id?: string): NumberParser {
		return new NumberParser(null, id, this);
	}

	numberPool(id?: string): NumberPool {
		return new NumberPool(null, id, this);
	}

	subscription(id?: string): Subscription {
		return new Subscription(null, id, this);
	}
}

export {
	RingCentral,    // For commonjs

	SERVER_PRODUCTION,
	SERVER_SANDBOX,
	API_VERSION
};