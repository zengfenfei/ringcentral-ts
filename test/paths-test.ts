import * as fetchMock from 'fetch-mock';
import { auth } from './setup';
import RingCentral from '../src/Client';


let rc: RingCentral;

before(async () => {
	rc = await auth();
});

describe('PathSegments', function () {

	it('Account', () => {
		rc.account().activeCalls();
		rc.account().serviceInfo();

		rc.account().extension().device();
		rc.account().extension().phoneNumber();
	});

	it('AnsweringRule', async () => {
		fetchMock.postOnce('end:/account/~/extension/~/answering-rule', {});
		let reqBody = {
			enabled: false,
			callers: [{
				callerId: '+46843216868'
			}]
		};
		await rc.account().extension().answeringRule().post(reqBody);

		fetchMock.deleteOnce('end:/account/~/extension/~/answering-rule/rule-id-to-delete', {});
		await rc.account().extension().answeringRule('rule-id-to-delete').delete();

		fetchMock.putOnce('end:/account/~/extension/~/answering-rule/rule-id-to-change', {});
		await rc.account().extension().answeringRule('rule-id-to-change').put({ name: 'updated.' });


		fetchMock.getOnce('end:/account/~/extension/~/answering-rule/rule-id', {});
		await rc.account().extension().answeringRule('rule-id').get();

		fetchMock.getOnce('end:/account/~/extension/~/answering-rule', {});
		await rc.account().extension().answeringRule().list();
	});

	it('gets business hours rule', function () {
		fetchMock.getOnce('end:/account/~/extension/~/business-hours', {});
		return rc.account().extension().businessHours().get();
	});

	describe('BlockedNumber', function () {

		it('covers all', async () => {
			let ext = rc.account().extension();
			let createdId = 'BlockNumberId';
			let createdBlockedPhoneNumber = '+18989999';
			fetchMock.once('*', {});
			await ext.blockedNumber().post({ phoneNumber: createdBlockedPhoneNumber });
			fetchMock.once('*', {});
			await ext.blockedNumber().put({ phoneNumber: createdBlockedPhoneNumber });
			fetchMock.once('*', {});
			await ext.blockedNumber(createdId).get();
			fetchMock.once('*', {});
			await ext.blockedNumber().list();
			fetchMock.once('*', {});
			await ext.blockedNumber(createdId).delete();
		});

	});

	describe('Contacts', function () {

		it('covers all', async () => {
			let addressBook = rc.account().extension().addressBook();
			let createdId = 'addressId';
			fetchMock.once('*', {});
			await addressBook.contact().post({ firstName: 'Test' });
			fetchMock.once('*', {});
			addressBook.contact(createdId).get();
			fetchMock.once('*', {});
			addressBook.contact().list();

			fetchMock.once('*', {});
			addressBook.contact(createdId).put({ firstName: 'ModifiedFirstName' });

			fetchMock.once('*', {});
			addressBook.contact(createdId).delete();
		});
	});

	describe('Subscription', function () {

		it('covers all', async () => {
			let createdId = 'subscriptionId';
			fetchMock.once('*', {});
			await rc.subscription().post({
				eventFilters: ['/restapi/v1.0/account/~/extension/~/presence?detailedTelephonyState=true'],
				deliveryMode: { transportType: 'PubNub', encryption: true }
			});
			fetchMock.once('*', {});
			await rc.subscription(createdId).get();
			fetchMock.once('*', {});
			await rc.subscription(createdId).put({ eventFilters: ['/restapi/v1.0/account/~/extension/~/message-store'] });
			fetchMock.once('*', {});
			await rc.subscription(createdId).delete();
			fetchMock.once('*', {});
			await rc.subscription(createdId).list();
		});

	});

	describe('Meeting', function () {

		it('covers all', async () => {
			let meetingId = 'MockMeetingId';
			fetchMock.postOnce('end:/account/~/extension/~/meeting/MockMeetingId/end', {});
			rc.account().extension().meeting(meetingId).end().post();

			fetchMock.postOnce('end:/account/~/extension/~/meeting', {});
			rc.account().extension().meeting().post({});

			fetchMock.getOnce('end:/account/~/extension/~/meeting', {});
			rc.account().extension().meeting().list();

			fetchMock.getOnce('end:/account/~/extension/~/meeting/' + meetingId, {});
			rc.account().extension().meeting(meetingId).get();

			fetchMock.deleteOnce('end:/account/~/extension/~/meeting/' + meetingId, {});
			rc.account().extension().meeting(meetingId).delete();

			fetchMock.putOnce('end:/account/~/extension/~/meeting/' + meetingId, {});
			rc.account().extension().meeting(meetingId).put({});
		});

		it('service info', function () {
			fetchMock.once('*', {});
			return rc.account().extension().meeting().serviceInfo().get().catch(e => console.log(e.detail));
		});

	});

	describe('Ringout', function () {

		it('covers all', async () => {
			let id = 'ringoutId';
			fetchMock.once('*', {});
			await rc.account().extension().ringout().post({
				from: { phoneNumber: '+16507411615' },
				to: { phoneNumber: '+16507411615' }
			});
			fetchMock.once('*', {});
			await rc.account().extension().ringout(id).get();

			fetchMock.once('*', {});
			await rc.account().extension().ringout(id).delete();
		});

	});

	describe('ForwardingNumber', function () {

		it('covers all', async () => {
			fetchMock.once('*', {});
			await rc.account().extension().forwardingNumber().list();

			fetchMock.once('*', {});
			await rc.account().extension().forwardingNumber().post({});
		});

	});

	describe('Group', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			let addressBook = rc.account().extension().addressBook();
			return addressBook.group().list();
		});

	});

	describe('Greeting', function () {

		// TODO add delete and update methods
		it('covers all', function () {

		});

	});

	describe('Conferencing', function () {

		it('covers all', function () {
		});

	});

	describe('Country', function () {

		it('covers all', function () {
			fetchMock.once('*', { records: [{ id: 'testid' }] });
			return rc.dictionary().country().list().then(res => {
				fetchMock.once('*', {});
				return rc.dictionary().country(res.records[0].id).get();
			});
		});

	});

	describe('State', function () {

		it('covers all', function () {
			fetchMock.once('*', { records: [{ id: 'testid' }] });
			return rc.dictionary().state().list().then(res => {
				fetchMock.once('*', {});
				return rc.dictionary().state(res.records[0].id).get();
			});
		});

	});

	describe('Device', function () {

		it('covers all', function () {
			fetchMock.once('*', { records: [{ id: 'testid' }] });
			return rc.account().device().list().then(res => {
				fetchMock.once('*', {});
				return rc.account().device(res.records[0].id).get();
			});
		});

	});

	describe('Timezone', function () {

		it('covers all', function () {
			fetchMock.once('*', { records: [{ id: 'testid' }] });
			return rc.dictionary().timezone().list().then(res => {
				fetchMock.once('*', {});
				return rc.dictionary().timezone(res.records[0].id).get();

			});
		});

	});

	describe('PhoneNumber', function () {

		it('covers all', function () {
			fetchMock.once('*', { records: [{ id: 'testid' }] });
			return rc.account().phoneNumber().list().then(res => {
				if (res.records.length > 0) {
					fetchMock.once('*', {});
					return rc.account().phoneNumber(res.records[0].id).get();
				}
			});
		});

	});

	describe('Language', function () {

		it('covers all', function () {
			fetchMock.once('*', { records: [{ id: 'test-id' }] });
			return rc.dictionary().language().list().then(res => {
				if (res.records.length > 0) {
					fetchMock.once('*', {});
					return rc.dictionary().language(res.records[0].id).get();
				}
			});
		});

	});

	describe('Message', function () {

		it('covers all', async () => {
			let id = 'message-id';
			fetchMock.once('*', {});
			await rc.account().extension().companyPager().post({
				to: [{ extensionNumber: '101' }],
				text: 'js-client unit test.'
			});
			fetchMock.once('*', {});
			await rc.account().extension().messageStore(id).delete();
			fetchMock.once('*', {});
			await rc.account().extension().messageStore(id).put({ readStatus: 'Read' });
			fetchMock.once('*', {});
			await rc.account().extension().messageStore().list();
			fetchMock.once('*', {});
			await rc.account().extension().messageStore('id').get();
		});

		it('gets sync message', function () {
			fetchMock.once('*', {});
			return rc.account().extension().messageSync().list();
		});

	});

	describe('AuthzProfile', function () {

		it('covers all', async () => {
			fetchMock.once('*', {});
			await rc.account().extension().authzProfile().get();
			fetchMock.once('*', {});
			await rc.account().extension().authzProfile().check().get();
		});

	});

	/*describe('Clientinfo', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.clientInfo().customData('testKey').put({ id: 'testId', value: 'testValue' });
		});

	});*/

	describe('ActiveCalls', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.account().extension().activeCalls().list();
		});

	});

	describe('Grant', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.account().extension().grant().list();
		});

	});

	describe('Location', function () {

		it('covers all', async () => {
			fetchMock.once('*', {});
			await rc.dictionary().state().list();
			fetchMock.once('*', {});
			await rc.dictionary().location().list({ stateId: 'testId' });
		});

	});

	/*describe('NumberPool', function () {

		it('covers all', () => {
			fetchMock.once('*', {});
			return rc.numberPool().lookup().post({ countryCode: 'cn' });
		});

	});*/

	describe('Department', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.account().department('~').members().list();
		});

	});

	describe('BusinessAddress', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.account().businessAddress().get().then(res => {
				fetchMock.once('*', {});
				return rc.account().businessAddress().put({ email: 'js-client-test@ringcentral.com' });
			});
		});

	});

	/*describe('DialingPlan', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.account().dialingPlan().list();
		});

	});*/

	describe('Presence', function () {

		it('covers all', function () {
			fetchMock.once('*', {});
			return rc.account().extension().presence().get();
		});

	});

	describe('CallLog', function () {

		it('gets call log sync', function () {
			fetchMock.once('*', {});
			return rc.account().extension().callLogSync().list({ recordCount: 5 }); // https://github.com/ringcentral/ringcentral-api-specs/issues/7
		});

		it('get call log by id', () => {
			fetchMock.once('*', {});
			return rc.account().callLog().get();
		});

	});

	describe('AddressBook', function () {

		it('gets address book sync', function () {
			fetchMock.once('*', {});
			return rc.account().extension().addressBookSync().get().list(); // https://github.com/ringcentral/ringcentral-api-specs/issues/7
		});
	});

	describe('NumberParser', function () {

		it('parses number', function () {
			fetchMock.once('*', {});
			return rc.numberParser().parse().post({});
		});

	});

	/*it('Order', async () => {
		fetchMock.once('*', {});
		await rc.account().order().post({});

		fetchMock.once('*', {});
		await rc.account().order('orderId').get();
	});*/

	it('Greetings', async () => {
		fetchMock.once('*', {});
		await rc.account().extension().greeting().get();

		fetchMock.once('*', {});
		await rc.account().extension().greeting().post({});
	});

	it('Conferencing', async () => {
		fetchMock.once('*', {});
		await rc.account().extension().conferencing().get();

		fetchMock.once('*', {});
		await rc.account().extension().conferencing().put({});
	});

	/*it('Reserve', () => {
		fetchMock.once('*', {});
		return rc.numberPool().reserve().post({});
	});*/

	it('Recording', () => {
		fetchMock.once('*', {});
		return rc.account().recording().get();
	});

});
