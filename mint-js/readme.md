# Mint.js (Browser SDK)

## Overview

> Splunk Mint.js is a JavaScript SDK that collects and captures usage data such as logs, events, network calls, session information, and browser information.

## Setting up Splunk Mint.js

## Installation

Download Mint.js through [Splunkbase](https://splunkbase.splunk.com/app/3722/).

    ```
    <script src="path/to/mint.js" type='text/javascript'></script>
    ```

## Initialization

Initialize the Mint SDK by calling the method listed below and passing optional configuration options. All configuration options have the default value, except apiKey. A valid apiKey is required to use Mint SDK.

You can also use instrumentation flags to track some events automatically. For example, collectLogs, collectNetworkCalls, collectUnhandledErrors, collectPageLoads, etc.

Turn these flags on and off by passing the following flag:

```js
Mint.initAndStartSession({ apiKey: 'YOUR_API_KEY' });
```

## Options in initialization


* ```appVersionName``` [String ```{1.2.1}```, defaults to ```N/A```]
> Used to identify your application version. appVersionName value is sent along with each event.

* ```batchSize``` [Number ```{5 | 10 | 20 | any positive Number}```, defaults to ```10```]
> batchSize is the number of events that are packaged before the data is sent to Splunk.

* ```inactivityInterval``` [Number in milliseconds ```{any positive number}```, defaults to ```30000 ```]
> inactivityInterval is the SDK inactivity timer after which the remaining events are sent, regardless of the batch size.

* ```userIdentifier``` [String ```{jondoe@somedoamin.com | '120039092' | 'jdoe' | any String or Number used to identify current user}```, defaults to ```N/A```]
> Any sort of unique String / Number used by your application or website to identify users. userIdentifier value is sent along with each event.

* ```collectLogs``` [Boolean ```{true|false}```, defaults to ```true```]
> Collects log data. For example, console.log, console.warn, console.info, console.error

* ```collectNetworkCalls``` [Boolean ```{true|false}```, defaults to ```true```]
> Collects data about Ajax calls.

* ```collectUnhandledErrors``` [Boolean ```{true|false}```, defaults to ```true```]
> Collects unhandled JS exceptions.

* ```collectPageLoads``` [Boolean ```{true|false}```, defaults to ```true```]
> Collects data about browser resources processing.

* ```collectDisplayInfo``` [Boolean ```{true|false}```, defaults to ```true```]
> Collects data about a user's browser window size and screen resolution.

* ```production``` [Boolean ```{true|false}```, defaults to ```true```]
> If set to false, the SDK doesn't work. You are zoned out in development mode.

* ```silent``` [Boolean ```{true|false}```, defaults to ```false```]
> Prevents propagation to the browser's console.

* ```packageName``` [String ```{your-package-name}```, defaults to ```10```]
> Prevents propagation to the browser's console.


Example:

```js
    Mint.initAndStartSession({ apiKey: 'YOUR_API_KEY', collectLogs: false, collectNetworkCalls: false });
```

## Public API (Session configuration)

### setUserIdentifier
Attaches user identifier to current session (defaults to 'NA')

```js
Mint.setUserIdentifier('YOUR-USER-IDENTIFIER');
```

### setPackageName

Sets custom package name (defaults to ```window.location.host```)

```js
Mint.setPackageName("YOUR-PACKAGE-NAME");
```

### setAppEnvironment

Sets custom app environment (defaults to 'NA')
```js
Mint.setAppEnvironment("YOUR-APP-ENVIRONMENT");
```


## Public API (SDK Usage)


### getMintUUID

Returns the Mint unique ID.

```js
Mint.getMintUUID();
> "YOUR-MINT-UUID"
```


### flush

Flushes saved DTO (data event object) that has not been sent to Splunk.

```js
Mint.flush();
```

### getOption

Returns the value of configuration options.

```js
Mint.getOption('production');
> true

Mint.getOption('userIdentifier');
> 'jondoe@somedomain.com'
```


### startSession

Starts a new session.
```js
Mint.startSession();
```


### closeSession
Closes current session. Flushes any saved DTOs.
```js
Mint.closeSession();
```


### transactionStart
Starts transaction tracking.
```js
Mint.transactionStart('ajax calls');
```

Optionally send additional data (key/value data).
```js
Mint.transactionStart('ajax calls', {productId: '123', someKey: 'someVal'});
```


### transactionStop
Stops transaction tracking.

```js
Mint.transactionStop('ajax calls');
```

Optionally send additional data (key/value data).
```js
Mint.transactionStop('ajax calls', {productId: '123', someKey: 'someVal'});
```

### transactionCancel

Cancels transaction tracking.
```js
Mint.transactionCancel('ajax Calls', 'CANCELING-REASON');
```

Optionally send additional data (key/value data).
```js
Mint.transactionCancel('Ajax Calls', 'CANCELING-REASON', {productId: '123', someKey: 'someVal'});
```


### addURLToBlackList

Network DTO will not capture the data with these URLs.

```js
Mint.addURLToBlackList('/EXAMPLE');
```


### addURLPatternToBlackList

Network DTO will not capture the data with these patterns.

```js
Mint.addURLPatternToBlackList('/EXAMPLE_PATTERN');
```
For example, the Ajax url is ```"http://splunk.com/view/user/123"``` and the pattern used is: ```Mint.addURLPatternToBlackList('/view/user');```
This will prevent the network call to not be tracked, given this pattern.
Note: We use ```networkUrl.indexOf(pattern) > -1``` to determine if there is a match or not.


### blackListedURLs
Returns all the blacklisted URLs and URL patterns as a string.

```js
Mint.addURLToBlackList('/bla')
Mint.blackListedURLs();
> "URLs: [/bla], URL Patterns: []"
```

### clearURLBlackList
Clears blacklist URLs.
```js
Mint.clearURLBlackList();
```


### clearURLBlackListPattern

Clears all blacklist patterns.

```js
Mint.clearURLBlackListPattern();
```


### logException

Allows you to log handled exceptions and append additional metadata to the crash report.

```js
try {
   rotateScreen();
} catch ( error ) {
   Mint.logException(error);
};
// or
try {
   rotateScreen();
} catch ( error ) {
   Mint.logException(error, {someKey: 'SomeValue'});
};
```

### logEvent

Log a user event to Splunk.

```js
Mint.logEvent('navigation menu clicked');

// or
Mint.logEvent('facebook login', 'info');
// with logging level: 'error', 'warn', 'info', 'log'

// send additional data
Mint.logEvent('facebook login', 'info', {someKey: 'SomeValue'});
```

### logConsole

Log anything to Splunk.

```js
Mint.logConsole('something mildly interesting happened');

or
Mint.logConsole('something mildly interesting happened', 'info');
// with logging level: 'error', 'warn', 'info', 'log'
```

### logBreadcrumb

Leave a breadcrumb behind. The maximum number of breadcrumbs is 16. By inserting a new breadcrumb when the list is full, the oldest one is removed.

```js
Mint.logBreadcrumb('login page');
```

### getBreadcrumbs

Returns all breadcrumbs.

```js
Mint.getBreadcrumbs();
> ['login page']
```

### addExtraData

Add key-value pairs to an extraData object.

```js
Mint.addExtraData('extra', 'data);
// or
Mint.addExtraData({extra1: 'data1', extra2: 'data2'});
```

### getExtraData

Returns all extra data.

```js
Mint.getExtraData();
> {someKey: 'someValue'}
```

### clearExtraData

Clears all extra data.

```js
Mint.getExtraData();
> {extra: 'data'}
Mint.clearExtraData();
Mint.getExtraData();
> {}
```

### removeExtraData

Removes extra data by key.

```js
Mint.getExtraData();
> {extra: 'data', extra2: 'data'}
Mint.removeExtraData(extra2);
Mint.getExtraData();
> {extra: 'data'}
```


### timerStart
Starts timer tracking and returns a unique timer ID. (ID is used to stop the timer.)
```js
var timerId = Mint.timerStart('name of timer');
```


### timerStop
Stops timer with specified timer ID and logs timer event with elapased_time as one of the fields.

```js
var timerId = Mint.timerStart('name of timer');
Mint.transactionStop(timerId);
```


### attachHandler

Enables you to attach a custom handler that will be used in the DTO factory to format your data.

```js
var eventCallback = function() { return somethingHere; };
Mint.attachHandler('event', eventCallback);
```

### callHandler

Call any registered handler at will (built-in or custom).

```js
Mint.callHandler('event', {key: 'value');
> {"key":"value","apiKey":"deadc0d3","osVersion":"OS X 10.10","device":"Firefox 38.0","platform":"Gecko","extraData":{}}
```


## For questions and support:
Contact: Sam Gazitt​ @ sgazitt@splunk.com