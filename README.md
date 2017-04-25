# RingCentral-ts

[![Build Status](https://travis-ci.org/zengfenfei/ringcentral-ts.svg?branch=master)](https://travis-ci.org/zengfenfei/ringcentral-ts)
[![Coverage Status](https://coveralls.io/repos/github/zengfenfei/ringcentral-ts/badge.svg?branch=master)](https://coveralls.io/github/zengfenfei/ringcentral-ts?branch=master)

This is a library implemented in typescript which provides convenient APIs for typescript/javascript developers to access [RingCentral REST API](https://developer.ringcentral.com/api-docs/latest/index.html). It can be used in both node.js and browser. [Full API Reference](https://zengfenfei.github.io/ringcentral-ts/).

# Table of contents

- [Getting Started](#getting-started)
- [Handle rate limit](#rate-limit-handling)
- [Cache the token](#tokenstore)
- [API Call Examples](#api-call-examples)
    - [Telephony Calls](#telephony-calls)
    - [Send SMS](#send-sms)
    - [Send Fax](#send-fax)
    - [Extension management](#extension-management)


## Getting started

### Install

```shell
yarn add ringcentral-ts
```
Or
```shell
npm install ringcentral-ts --save
```

### Import the module

```javascript
// In Typescript or ES6 (Recommended)
import RingCentral, { SERVER_SANDBOX } from 'ringcentral-ts';

// In commonjs(node.js, webpack and browserify)
var ringcentral = require('ringcentral-ts');
var RingCentral = ringcentral.RingCentral;
var SERVER_SANDBOX = ringcentral.SERVER_SANDBOX;
```


### Prerequisites
To perform subsequent operations, you need a ringcentral appKey (apply at https://developer.ringcentral.com/) and a ringcentral account. 

### Quick Start

Login, logout, get current ringcentral account info.

```javascript
let rc = new RingCentral({
    server: SERVER_SANDBOX, // You should use SERVER_PRODUCTION in production
    appKey: '{yourAppKey}',
    appSecret: '{yourAppSecret}'
});

// Log into RingCentral
rc.auth({
    username: '{username}',
    extension: '{extension}',
    password: '{password}'
}).then(() => {
    console.log('login success');
    return rc.account().get();   // Call RingCentral REST API
}).then(accountInfo => {
    console.log("Current account info", accountInfo);
    return rc.logout();	// Logout
}).then(() => {
    console.log("logout success");
}).catch(e => {
    console.error('Error occured', e);
});
```

## Rate limit handling

You can only call RingCentral API at [limited rate](http://ringcentral-api-docs.readthedocs.io/en/latest/rate_limits/). By default, when rate limit hit, it will wait until the service is available and resend the API request. To prevent this behavior, you can set the `handleRateLimit` option of the constructor:

```javascript
let rc = new RingCentral({
    handleRateLimit: false,
    ...
});
```

## TokenStore

By default the token is stored in memory, it will be lost when the process exits in node or the web page reloads. You can specify a `TokenStore` to cache the token in `localStorage`, file, redis or other databases, etc.

Creating Token Store:
```javascript
// In browser, you can cache the token in localStorage
import WebTokenStore from 'ringcentral-ts/WebTokenStore';
let tokenStore = new WebTokenStore('{localStorageKey}', localStorage);

// In node.js, you can cache the token in file
import FileTotkenStorage from 'ringcentral-ts/FileTokenStore';
let tokenStore = new FileTotkenStorage('{filePathToStoreTheToken}');
```

Check token in token store:
```javascript
let rc = new RingCentral({
    tokenStore
    ...
});
rc.getToken({   // Optionally, you can specify the username and extension to check with the stored token.
    username: 'xxx',
    extension: 'xxx'
}).then((token) => {
    console.log('Token is valid in the token store', token);
}, e => {
    console.log('Fail to load token from tokenStore, possible reasons: the access token and refresh token in the store both expire; no token is cached in the store; the cached token is created by a different appKey or RC account.');
    return rc.auth({	// Create new token by password or oauth
        ...
    });
});
```

Except for memory, `localStorage` and file, you can also implement your own [`TokenStore`](https://zengfenfei.github.io/ringcentral-ts/interfaces/_token_.tokenstore.html) to cache the token in other places.

## API Call Examples

### Telephony Calls

1. Make phone calls by ringout(https://developer.ringcentral.com/api-docs/latest/index.html#!#MakeRingOut.html):

   ```javascript
    rc.account().extension().ringout().post({
        from: { phoneNumber: 'xxx' },
        to: { phoneNumber: 'xxx' },
        callerId: { phoneNumber: 'xxx' }
    }).then(ringout => {
        console.log('Ringout sucess', ringout);
        // To check the call status: `rc.account().extension().ringout(ringout.id).get();`
    }, e => {
        console.error('Fail to ringout', e);
    });
    ```

2. Track the telephony status

    To get notications when calls come in, go out or ends, subscribe to the [**Presence Event**](https://developer.ringcentral.com/api-docs/latest/index.html#!#RefGetDetailedExtensionPresenceEvent):
    ```javascript
    let subscription = rc.createSubscription();
    subscription.onMessage(msg => {
        let presenceEvt = msg.body;
        console.log('>> telephonyStatus', presenceEvt.telephonyStatus);
        console.log('>> activeCalls', presenceEvt.activeCalls);
        console.log('@@ presence event', presenceEvt);
    });
    subscription.subscribe(['/account/~/extension/~/presence?detailedTelephonyState=true']).then(subscription => {
        console.log('Subscription created', subscription);
    }, e => {
        console.error('Fail to subscribe', e);
    });
    ```

3. View the list of active calls
    ```javascript
    rc.account().extension().activeCalls().list({
        page: 1,    // Get the 1st page of the result
        direction: "Inbound"    // Specify the direction of the call, omit to get all directions
    }).then(results => {
        console.log("Active calls", results.records);
    }, e => {
        console.error("Fail to get active calls", e);
    });
    ```

4. View the recent calls

    ```javascript
    let dateFrom = new Date(Date.now() - 24 * 60 * 60 * 1000);  // A day ago
    rc.account().extension().callLog().list({ dateFrom: dateFrom.toISOString() }).then(results => {
        console.log("Recent call logs", results.records);
    }, e => {
        console.error("Fail to get call logs", e);
    });
    ```

### Send SMS
```javascript
rc.account().extension().sms().post({
	to: [{
		phoneNumber: "{receiverPhoneNumber}"
	}],
	from: {
		phoneNumber: "{yourSmsNumber}"
	},
	text: "Sms content"
}).then(function(messageInfo) {
	console.log("Sms sent successfully", messageInfo);
}).catch(function(e) {
	console.error("Fail to send sms", e);
});
```

### Send Fax

For all supported options and mediatype, please refer to https://developer.ringcentral.com/api-docs/latest/index.html#!#RefFaxMessages.html.

```javascript
import * as fs from "fs";
rc.account().extension().fax().post({
            to: [{ phoneNumber: "{receiverPhoneNumber}" }],
            faxResolution: 'High'
        }, [    // Second argument is an array of attachments, attachment can be string, Blob, node readable stream.
                "{Message text}",
                fs.createReadStream("{filePath}")   // In node only
            ]);
    });
```

### Extension management

Get detail information of an extension:

```javascript
rc.account().extension('theExtensionId').get().then(function (extInfo) {
    console.log("The extension info", extInfo);
}).catch(function (e) {
    console.error("Get extension error", e);
});
```

List extensions of an account:

```javascript
rc.account("theAccountId").extension().list().then(function (extensions) {
    console.log("The list of extension info", extensions.records);
}).catch(function (e) {
    console.error("Get extension list error", e);
});
```

Update infomation of an extension:

```javascript
rc.account().extension().put({ status: "Enabled" }).then(function () {
    console.log("Success to update extension.");
}).catch(function () {
    console.error("Fail to update extension.");
});
```