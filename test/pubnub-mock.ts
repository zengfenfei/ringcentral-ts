let RealPubnub = require('pubnub');
let pubnubs: MockedPubNub[] = [];

export class MockedPubNub {

	subscribeKey: string;
	listeners: Listener[] = [];
	channels: string[];

	realPubnub: any;

	constructor(opts: { subscribeKey: string }) {
		this.subscribeKey = opts.subscribeKey;
		this.realPubnub = new RealPubnub(opts);
		this['encrypt'] = this.realPubnub.encrypt;
		this['decrypt'] = this.realPubnub.decrypt;
		pubnubs.push(this);
	}

	subscribe(opts: { channels: string[] }) {
		this.channels = opts.channels;
	}

	addListener(listener: Listener) {
		this.listeners.push(listener);

		setTimeout(() => this.mockedConnected(), 0);
	}


	// Methods to do mocking operations
	mockedConnected() {
		for (let l of this.listeners) {
			l.status({
				category: 'PNConnectedCategory',
				operation: 'PNSubscribeOperation'
			});
		}
	}

	mockMessage(msg) {
		let pubnubMsg = {
			channel: this.channels[0],
			subscription: undefined,
			actualChannel: null,
			subscribedChannel: this.channels[0],
			timetoken: '14933652238078468',
			publisher: undefined,
			message: msg
		}
		this.listeners.forEach(l => l.message(pubnubMsg));
	}

	static OPERATIONS = RealPubnub.OPERATIONS;
	static CATEGORIES = RealPubnub.CATEGORIES;
}


mockPubnub();


export function getLastPubnub() {
	return pubnubs[pubnubs.length - 1];
}

function mockPubnub() {

	let id = require.resolve('pubnub');
	require.cache[id].exports = MockedPubNub;
}

export interface Listener {
	message: Function;
	status: Function;
}
