import { expect } from 'chai';
import { createReadStream } from 'fs';
import * as fetchMock from 'fetch-mock';
import { auth } from './setup';
import RingCentral from '../src/Client';
import '../src/Client-test';
import '../src/RestClient-test';
import '../src/Subscription-test';
import './paths-test';

let rc: RingCentral;
const inNode = !!createReadStream;


before(async () => {
	rc = await auth();
});

describe('Account', function () {

	it('Get Account info', async () => {
		const sampleData = {
			'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/105655021',
			'id': 105655021,
			'serviceInfo': {
				'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/105655021/service-info',
				'brand': {
					'id': '1210',
					'name': 'RingCentral',
					'homeCountry': {
						'id': '1',
						'uri': 'https://platform.ringcentral.com/restapi/v1.0/dictionary/country/1',
						'name': 'United States',
						'isoCode': 'US',
						'callingCode': '1'
					}
				},
				'servicePlan': {
					'id': '4519',
					'name': 'Office Enterprise 100 line',
					'edition': 'Enterprise'
				},
				'billingPlan': {
					'id': '3350',
					'name': 'Annual-47988-Ent 100 line',
					'durationUnit': 'Month',
					'duration': 12,
					'type': 'Regular',
					'includedPhoneLines': 100
				}
			},
			'operator': {
				'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/105655021/extension/105655021',
				'id': 111115021,
				'extensionNumber': '10000'
			},
			'mainNumber': '+13213042353',
			'status': 'Confirmed',
			'signupInfo': {
				'tosAccepted': true
			},
			'setupWizardState': 'Completed',
			'regionalSettings': {
				'timezone': {
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/dictionary/timezone/58',
					'id': '58',
					'name': 'US/Pacific',
					'description': 'Pacific Time (US & Canada)',
					'bias': '-480'
				},
				'homeCountry': {
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/dictionary/country/1',
					'id': '1',
					'name': 'United States'
				},
				'language': {
					'id': '1033',
					'name': 'English (United States)',
					'localeCode': 'en-US'
				},
				'greetingLanguage': {
					'id': '1033',
					'name': 'English (United States)',
					'localeCode': 'en-US'
				},
				'formattingLocale': {
					'id': '1033',
					'name': 'English (United States)',
					'localeCode': 'en-US'
				},
				'timeFormat': '12h'
			}
		};
		fetchMock.getOnce('end:/account/~', { body: sampleData });
		const account = await rc.account().get();
		expect(account).to.deep.eq(sampleData);
	});

	it('Get Account info with id not exists should return 404', async () => {
		const sampleData = {
			errorCode: 'InvalidParameter',
			message: 'Resource for parameter [accountId] is not found',
			errors:
			[{
				errorCode: 'CMN-102',
				message: 'Resource for parameter [accountId] is not found',
				parameterName: 'accountId'
			}],
			parameterName: 'accountId'
		};
		fetchMock.getOnce('end:/account/accountIdNotExist', { status: 404, body: sampleData, headers: { 'content-type': 'application/json' } });
		try {
			await rc.account('accountIdNotExist').get();
		} catch (e) {
			expect(e.detail).to.deep.eq(sampleData);
			expect(e.rawRes.status).to.eq(404);
			expect(e.code).to.equal('InvalidParameter');
		}

	});

});

describe('Extension', function () {
	// let extensionProps = ['uri', 'id', 'extensionNumber', 'contact', 'name', 'type', 'status', 'permissions', 'profileImage'];

	it('get current extension', () => {
		let sampleData = {
			'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/777655028/extension/777655028',
			'id': 777655028,
			'extensionNumber': '10000',
			'contact': {
				'firstName': 'John',
				'lastName': 'Smith',
				'company': 'Something New',
				'email': 'John.Smith@yourcompany.com',
				'businessPhone': '+14074524481',
				'businessAddress': {
					'street': '1400 Fashion Island Blvd, |Ste 700',
					'city': 'San Mateo',
					'state': 'CA',
					'zip': '94404-2073',
					'country': 'United States'
				},
				'emailAsLoginName': true,
				'pronouncedName': {
					'type': 'TextToSpeech',
					'text': 'Something New'
				}
			},
			'name': 'John Smith',
			'type': 'User',
			'status': 'Enabled',
			'departments': [
				{
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/777655028/extension/777407028',
					'id': '777407028',
					'extensionNumber': '50000'
				},
				{
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/777655028/extension/479254028',
					'id': '479254028',
					'extensionNumber': '2'
				},
				{
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/777655028/extension/598109028',
					'id': '598109028',
					'extensionNumber': '3'
				}
			],
			'serviceFeatures': [
				{
					'featureName': 'SMS',
					'enabled': true
				},
				{
					'featureName': 'SMSReceiving',
					'enabled': true
				},
				{
					'featureName': 'Pager',
					'enabled': true
				},
				{
					'featureName': 'PagerReceiving',
					'enabled': true
				},
				{
					'featureName': 'Voicemail',
					'enabled': true
				},
				{
					'featureName': 'Fax',
					'enabled': true
				},
				{
					'featureName': 'FaxReceiving',
					'enabled': true
				},
				{
					'featureName': 'DND',
					'enabled': true
				},
				{
					'featureName': 'RingOut',
					'enabled': true
				},
				{
					'featureName': 'InternationalCalling',
					'enabled': true
				},
				{
					'featureName': 'Presence',
					'enabled': true
				},
				{
					'featureName': 'VideoConferencing',
					'enabled': true
				},
				{
					'featureName': 'SalesForce',
					'enabled': true
				},
				{
					'featureName': 'Intercom',
					'enabled': true
				},
				{
					'featureName': 'Paging',
					'enabled': true
				},
				{
					'featureName': 'Conferencing',
					'enabled': true
				},
				{
					'featureName': 'VoipCalling',
					'enabled': true
				},
				{
					'featureName': 'FreeSoftPhoneLines',
					'enabled': true
				},
				{
					'featureName': 'HipaaCompliance',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'CallPark',
					'enabled': true
				},
				{
					'featureName': 'OnDemandCallRecording',
					'enabled': false,
					'reason': 'ExtensionLimitation'
				},
				{
					'featureName': 'Reports',
					'enabled': true
				},
				{
					'featureName': 'CallForwarding',
					'enabled': true
				},
				{
					'featureName': 'DeveloperPortal',
					'enabled': true
				},
				{
					'featureName': 'EncryptionAtRest',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'BlockedMessageForwarding',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'EmergencyCalling',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'HDVoice',
					'enabled': true
				},
				{
					'featureName': 'SingleExtensionUI',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'CallSupervision',
					'enabled': true
				},
				{
					'featureName': 'VoicemailToText',
					'enabled': true
				},
				{
					'featureName': 'WebPhone',
					'enabled': true
				},
				{
					'featureName': 'RCTeams',
					'enabled': true
				},
				{
					'featureName': 'UserManagement',
					'enabled': true
				},
				{
					'featureName': 'Calendar',
					'enabled': true
				},
				{
					'featureName': 'PasswordAuth',
					'enabled': true
				},
				{
					'featureName': 'CallerIdControl',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'AutomaticInboundCallRecording',
					'enabled': true
				},
				{
					'featureName': 'AutomaticOutboundCallRecording',
					'enabled': true
				},
				{
					'featureName': 'AutomaticCallRecordingMute',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'SoftPhoneUpdate',
					'enabled': true
				},
				{
					'featureName': 'LinkedSoftphoneLines',
					'enabled': false,
					'reason': 'AccountTypeLimitation'
				},
				{
					'featureName': 'CallQualitySurvey',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'AccountFederation',
					'enabled': false,
					'reason': 'AccountLimitation'
				},
				{
					'featureName': 'MMS',
					'enabled': true
				},
				{
					'featureName': 'AccountDirectory',
					'enabled': false,
					'reason': 'AccountLimitation'
				}
			],
			'regionalSettings': {
				'timezone': {
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/dictionary/timezone/58',
					'id': '58',
					'name': 'US/Pacific',
					'description': 'Pacific Time (US & Canada)',
					'bias': '-480'
				},
				'homeCountry': {
					'uri': 'https://platform.ringcentral.com/restapi/v1.0/dictionary/country/1',
					'id': '1',
					'name': 'United States',
					'isoCode': 'US',
					'callingCode': '1'
				},
				'language': {
					'id': '1033',
					'name': 'English (United States)',
					'localeCode': 'en-US'
				},
				'greetingLanguage': {
					'id': '1033',
					'name': 'English (United States)',
					'localeCode': 'en-US'
				},
				'formattingLocale': {
					'id': '1033',
					'name': 'English (United States)',
					'localeCode': 'en-US'
				},
				'timeFormat': '12h'
			},
			'setupWizardState': 'Completed',
			'permissions': {
				'admin': {
					'enabled': true
				},
				'internationalCalling': {
					'enabled': true
				}
			},
			'profileImage': {
				'uri': 'https://media.ringcentral.com/restapi/v1.0/account/777655028/extension/777655028/profile-image',
				'etag': 'becbcfba92b60774a210234890018d78',
				'contentType': 'image/png',
				'lastModified': '2017-04-24T02:24:14.977Z',
				'scales': [
					{
						'uri': 'https://media.ringcentral.com/restapi/v1.0/account/777655028/extension/777655028/profile-image/90x90'
					},
					{
						'uri': 'https://media.ringcentral.com/restapi/v1.0/account/777655028/extension/777655028/profile-image/195x195'
					},
					{
						'uri': 'https://media.ringcentral.com/restapi/v1.0/account/777655028/extension/777655028/profile-image/584x584'
					}
				]
			},
			'account': {
				'uri': 'https://platform.ringcentral.com/restapi/v1.0/account/777655028',
				'id': '777655028'
			}
		};
		fetchMock.getOnce('end:/account/~/extension/~', { body: sampleData });
		return rc.account().extension().get().then(ext => {
			expect(ext).to.deep.eq(sampleData);
		});
	});

	it('Get extension list', function () {
		fetchMock.getOnce('end:/account/~/extension', { fake: 'data' });
		return rc.account().extension().list().then(exts => {
			// shouldBePagingResult(exts);
			// expect(exts.records[0]).to.has.keys(extensionProps);
		});
	});

	it('Union type parameters, update extension info', function () {
		fetchMock.putOnce('end:/account/~/extension/~', { fake: 'data' });
		let reqBody = { status: 'Enabled' };
		return rc.account().extension().put(reqBody).then(ext => {
			expect(fetchMock.lastOptions().body).to.deep.eq(JSON.stringify(reqBody));
			// expect(ext).to.contain.keys(extensionProps);
		});
	});
});

describe('Binary response', function () {
	it('Get message content as binary', async () => {
		let dateFrom = new Date().toISOString();
		fetchMock.getOnce('end:/account/~/extension/~/message-store?dateFrom=' + encodeURIComponent(dateFrom), { fake: 'data' });
		await rc.account().extension().messageStore().list({ dateFrom });

		fetchMock.getOnce('end:/account/~/extension/~/message-store/the-message-id/content/content-id', { fake: 'data' });
		await rc.account().extension().messageStore('the-message-id').content('content-id').get();
	});

	it('Get recording content', async () => {
		fetchMock.getOnce('end:/account/~/recording/recording-id/content', { fake: 'data' });
		await rc.account().recording('recording-id').content().get();
	});

});

let imgPath = './test/res/banner_index_logged.png';
describe('Binary request', function () {

	before('Only run in node', function () {
		if (!inNode) {
			this.skip();
		}
	});

	it('Put profile image, input binary, response is empty.', async () => {
		fetchMock.putOnce('end:/account/~/extension/~/profile-image', { fake: 'data' });
		await rc.account().extension().profileImage().put(createReadStream(imgPath));
	});

	it('Post profile image, input binary, response is empty.', function () {
		fetchMock.putOnce('end:/account/~/extension/~/profile-image', { fake: 'data' });
		return rc.account().extension().profileImage().post(createReadStream(imgPath));
	});

	it('gets current profile image', function () {
		fetchMock.getOnce('end:/account/~/extension/~/profile-image', { fake: 'data' });
		return rc.account().extension().profileImage().get();
	});

});

describe('Fax', function () {

	it('send fax, post form data', async () => {
		fetchMock.once('end:/account/~/extension/~/fax', {});
		let attachments;
		if (createReadStream) {
			attachments = ['Text attentment for test. Followed by a png picture.', createReadStream(imgPath)];
		} else {
			attachments = ['Test fax test sent from browser, ' + navigator.userAgent];
		}
		await rc.account().extension().fax().post({ to: [{ phoneNumber: '+16507411666' }] }, attachments);
	});

	/*it('send fax fail, empty parameter', () => {
		return client.account().extension().fax().post({}, []).then(msg => {
			throw new Error('should not send.');
		}, e => {
			expect(e.code).to.eq('InvalidParameter');
		});
	});*/
});

describe('Call Log', () => {
	it('Get call log', async () => {
		let dateFrom = new Date().toISOString();
		fetchMock.getOnce(`end:/account/~/extension/~/call-log?dateFrom=${encodeURIComponent(dateFrom)}&withRecording=true`, { fake: 'data' });
		await rc.account().extension().callLog().list({ dateFrom, withRecording: true });
	});

	it('delete today\'s call log', () => {
		fetchMock.deleteOnce('end:/account/~/extension/~/call-log', { fake: 'data' });
		return rc.account().extension().callLog().delete();
	});
});

describe('post', () => {

	it('send sms, post plain object', () => {
		fetchMock.postOnce('end:/account/~/extension/~/sms', {});
		let reqBody = {
			from: { phoneNumber: '+17322764403' },
			text: 'test sms text content.',
			to: [{ phoneNumber: '+16507411615' }],
		};
		return rc.account().extension().sms().post(reqBody).then(sms => {
			expect(fetchMock.lastOptions().body).to.deep.eq(JSON.stringify(reqBody));
		});
	});

	/*it('send sms, without from', () => {
		return client.account().extension().sms().post({ text: 'test sms text content.', to: [{ phoneNumber: '+16507411615' }] }).then(sms => {
			throw new Error('should fail');
		}).catch(e => {
			expect(e.code).to.eq('InvalidParameter');
		});
	});*/
});

/*function shouldBePagingResult(list) {
	expect(list).to.has.keys(['navigation', 'paging', 'records', 'uri']);
}*/
