(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Mint", [], factory);
	else if(typeof exports === 'object')
		exports["Mint"] = factory();
	else
		root["Mint"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 17);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/* global WEBPACK_DEFINE_PRODUCTION, Mint */
var formatters = __webpack_require__(7);
var dispatcher = __webpack_require__(10);
var config = __webpack_require__(1);

var DEFAULT_INACTIVITY_INTERVAL = 30000; // 30 seconds

var dtos = [];
if(false) {
  // make this available in non-prod env to assist running test cases
  window.getdto = function() {
    return dtos;
  }
}


//makes batches of data and forwards to dispatchData method
var forwardData = function (flush) {
  //For flush, dispatch remaining data
  if (flush === 'flush' && dtos.length > 0) {
    dispatcher.dispatchData(dtos);
    dtos = [];
  }
  //For unload, dispatch remaining data using sendBeacon method
  else if (flush === 'unload' && dtos.length > 0) {
    dispatcher.sendFinalData(dtos);
    dtos = [];
  }
  //dispatch as a batch
  else {
    var batchSize = config.getOption('batchSize') || 10;
    if (dtos.length > batchSize) {
      var data = dtos.splice(0, batchSize);
      dispatcher.dispatchData(data);
    }
  }
};

function kickInactivityTimer() {
  var inactivityInterval = config.getOption('inactivityInterval') || DEFAULT_INACTIVITY_INTERVAL;
  if(inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = setTimeout(function() {
    if(dtos.length > 0) {
      forwardData('flush');
    }
  }, inactivityInterval);
}

var inactivityTimer;
//formats and packages the DTOs
var factory = function(type, data) {

  // if production option is false do not log data. Essentially disable the sdk
  if(config.getOption('production') !== true) {
    return;
  }

  kickInactivityTimer();

  if (type === undefined && data === undefined) {
    forwardData('flush');
  } else if (type === 'unload') {
    forwardData('unload');
  } else {
    var dto = formatters.callFormatter(data, type);
    dtos.push(dto);
    forwardData('batch');
    return dto;
  }
};

exports = module.exports = factory;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* global WEBPACK_DEFINE_SDK_VERSION */


var _ = __webpack_require__(3);
var platform = __webpack_require__(20);


var uuid = __webpack_require__(23);


var options = {};


var defaults = {
  appEnvironment: 'NA',
  apiKey: null,
  appRunningState: 'NA',
  appVersionName: 'NA',
  appVersionCode: 'NA',
  batteryLevel: 'NA',
  baseURL: 'https://API_KEY.api.splkmobile.com',
  browser: platform.name,
  browserVersion: platform.version,
  currentView: window.document.location.pathname,
  carrier: 'NA',
  connection: 'NA',
  host: window.location.hostname,
  device: window.navigator.platform,
  locale: window.navigator.language,
  msFromStart: 'NA',
  osVersion: platform.os.toString(),
  userIdentifier: 'NA',
  platform: 'Web',
  packageName: window.location.host,
  protocol: window.location.protocol.toUpperCase().replace(':', ''),
  previous: document.referrer ? document.referrer : 'NA',
  remoteIP: '3.0.0.0',
  sdkVersion: "1.0.0",
  session_id: null,
  screenOrientation: window.screen.orientation,
  transactions: [],
  url: window.location.href,

  // configurable variables
  collectLogs: true,
  collectUnhandledErrors: true,
  collectNetworkCalls: true,
  collectPageLoads: true,
  collectDisplayInfo: true,
  production: true,
  silent: false,
  batchSize: 10,
  inactivityInterval: 30000, // 30 seconds
  uuid: uuid(),

  // HTTP EVENT Collector variables
  token: 'NA',
  hecURL: 'NA',
  sendToHEC: false
};


var validateOptions = function(options) {

  if(!options.apiKey) {
    // this is because we want to inform user about this errors instead of silently catching and sending home
    setTimeout(function() {
      throw new Error('MintJs: API Key must be provided!');
    },0);
    throw new Error('MintJs: API Key must be provided!');
  }

  if(!options.baseURL) {
    setTimeout(function() {
      throw new Error('MintJs: baseUrl can not be empty!');
    },0);
    throw new Error('MintJs: baseUrl can not be empty!');
  }
  return options;
};

var deriveOptions = function (newOptions, baseOptions) {
  //overrides/extends default options.
  //Only certain options are available to override.
  var keys = ['apiKey',
    'appVersionName',
    'batchSize',
    'inactivityInterval',
    'userIdentifier',
    'baseURL',
    'collectLogs',
    'collectNetworkCalls',
    'collectUnhandledErrors',
    'collectPageLoads',
    'collectDisplayInfo',
    'production',
    'silent',
    'token',
    'packageName'];

  var picked = _.pick(newOptions, keys);
  options = _.extend(options, _.extend(baseOptions, picked));

  // update baseURL
  var baseURL = options['baseURL'];
  if (typeof baseURL === 'string' && baseURL.indexOf('://API_KEY') > -1) {
    options['baseURL'] = baseURL.replace('API_KEY', getOption('apiKey'));
  }

  return options;
};

function getOption (key) {
  return options[key];
}

function getOptions () {
  return options;
}

function getDefaultOptions () {
  return defaults;
}




module.exports = {
  getOption: getOption,
  getOptions: getOptions,
  getDefaultOptions: getDefaultOptions,
  deriveOptions: deriveOptions,
  validateOptions: validateOptions
};



/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = function () {
  return Date.now();
};



/***/ }),
/* 3 */
/***/ (function(module, exports) {

var utility = {
    extend: function ( defaults, options ) {
        var extended = {};
        var prop;
        for (prop in defaults) {
            if (Object.prototype.hasOwnProperty.call(defaults, prop)) {
                extended[prop] = defaults[prop];
            }
        }
        for (prop in options) {
            if (Object.prototype.hasOwnProperty.call(options, prop)) {
                extended[prop] = options[prop];
            }
        }
        return extended;
    },

    pick: function( newOptions, keys ) {
        return keys.reduce(function(o, k) {
            if ( newOptions[k] !== undefined ) {
                o[k] = newOptions[k];
            }
            return o;
        }, {});
    },

    omit: function( obj, omitKey ) {
        return Object.keys(obj).reduce(function(result, key) {
            if(key !== omitKey) {
                result[key] = obj[key];
            }
            return result;
        }, {});
    },

    union: function (x, y) {
        var r = x ? x.slice(0) : [];
        y.forEach(function(i) { if (r.indexOf(i) < 0) r.push(i); });
        return r;
    }
};

module.exports = utility;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var timestamp = __webpack_require__(2);
var generateV4 = __webpack_require__(6);

var generateSessionID = function () {
  var time = timestamp().toString();
  time = time.substr(time.length - 4, time.length);
  var sub_uuid = generateV4();
  sub_uuid = sub_uuid.substr(0, 4);
  return sub_uuid.concat(time);	
}

module.exports = generateSessionID


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(3);
var extraData = {};

var isUndefined = function(obj) {
    return obj === void 0;
};

//appends extra data for all DTOs
var addExtraData = function (key, value) {
  //#todo detect if object is passed istead assuming object passed when value is not there
  if (!isUndefined(key) && isUndefined(value)) {
    extraData = _.extend(key, extraData);
  } else {
    extraData[key] = value;
  }

  return extraData;
};

var removeExtraData = function (key) {
  delete extraData[key];
};

var clearExtraData = function (key) {
  extraData = {};
};

var getExtraData = function () {
  return extraData;
};

exports.addExtraData = addExtraData;
exports.getExtraData = getExtraData;
exports.removeExtraData = removeExtraData;
exports.clearExtraData = clearExtraData;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

var generateV4 = function() {
var a, b;
    for(
    b=a='';
    a++<36;
    b+=a*51&52  // if "a" is not 9 or 14 or 19 or 24
        ?  //  return a random number or 4
    (
        a^15      // if "a" is not 15
            ?      // genetate a random number from 0 to 15
        8^Math.random()*
        (a^20?16:4)  // unless "a" is 20, in which case a random number from 8 to 11
              :
           4            //  otherwise 4
           ).toString(16)
                  :
         '-'            //  in other cases (if "a" is 9,14,19,24) insert "-"
      );
  return b
}

module.exports = generateV4;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/* eslint no-console: off */

var _ = __webpack_require__(3);
var baseFormatter = __webpack_require__(8);
var customFormatter = __webpack_require__(24);

//calls the appropriate formatter
var callFormatter = function (data, type) {
    if(type !== undefined && data !== undefined){
        return customFormatter[type].call(this, data, type);
    } else {
        console.warn('Define both type and data as arguments');
        return null;
    }
};

//public method for user to call appropriate formatter
var attachFormatter = function (name, callback) {
    customFormatter[name] = function (data, type) {
        var response = callback(data);
        return _.extend(response, baseFormatter(type), {});
    };
};

exports.attachFormatter = attachFormatter;
exports.callFormatter = callFormatter;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var timestamp = __webpack_require__(2);
var config = __webpack_require__(1);
var extra = __webpack_require__(5);


//baseFormatter consists of the base fields to be included in DTOs with default values
var baseFormatter = function (type) {
    if(type !== undefined){
        return {
            apiKey: config.getOption('apiKey'),
            appEnvironment: config.getOption('appEnvironment'),
            appRunningState: config.getOption('appRunningState'),
            appVersionCode: config.getOption('appVersionCode'),
            appVersionName: config.getOption('appVersionName'),
            batteryLevel: config.getOption('batteryLevel'),
            carrier: config.getOption('carrier'),
            connection: config.getOption('connection'),
            currentView: config.getOption('currentView'),
            device: config.getOption('device'),
            msFromStart: config.getOption('msFromStart'),
            osVersion: config.getOption('osVersion'),
            packageName: config.getOption('packageName'),
            platform: config.getOption('platform'),
            protocol: config.getOption('protocol'),
            remoteIP: config.getOption('remoteIP'),
            screenOrientation: config.getOption('screenOrientation'),
            sdkVersion: config.getOption('sdkVersion'),
            session_id: config.getOption('session_id'),
            state: navigator.onLine === true ? 'CONNECTED' : 'DISCONNECTED',
            transactions: config.getOption('transactions'),
            url: config.getOption('url'),
            userIdentifier: config.getOption('userIdentifier'),
            uuid: config.getOption('uuid'),
            locale: config.getOption('locale'),
            browser: config.getOption('browser'),
            browserVersion: config.getOption('browserVersion'),
            extraData: extra.getExtraData(),
            timestamp: timestamp(),
            previous: config.getOption('previous'),
            elapsedTime: config.getOption('elapsedTime'),
            host: config.getOption('host'),
            sdkPlatform: config.getOption('sdkPlatform'),

            type: type
        }
    } else {
        return null;
    }
}

module.exports = baseFormatter;



/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * JavaScript Cookie v2.0.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	if (true) {
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		var _OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = _OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				value = encodeURIComponent(String(value));
				value = value.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				return (document.cookie = [
					key, '=', value,
					attributes.expires && '; expires=' + attributes.expires.toUTCString(), // use expires attribute, max-age is not supported by IE
					attributes.path    && '; path=' + attributes.path,
					attributes.domain  && '; domain=' + attributes.domain,
					attributes.secure ? '; secure' : ''
				].join(''));
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var name = parts[0].replace(rdecode, decodeURIComponent);
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					cookie = converter && converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.get = api.set = api;
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init();
}));


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

var qwest = __webpack_require__(26);
var cache = __webpack_require__(11);
var config = __webpack_require__(1);

var API_VERSION = '1.0';

//sends data to CDS URL
var sendData = function (url, data, dtos) {
  var headers = {};

  // setting different headers
  if (config.getOption('sendToHEC')) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
    headers['Authorization'] = 'Splunk <token>'.replace('<token>', config.getOption('token'));
  } else {
    headers['Content-Type'] = 'application/json;charset=UTF-8';
    headers['X-Splunk-Mint-Send-CORS'] = true;
  }

//Uses a post request. If there is an error, save the data in the cache and try it later on the next page load. See cache.js
  qwest.post(url, data, {dataType: 'text', headers: headers})
       .catch(function () {
         cache.save(dtos);
       });
};

var bundleDTOs = function (dtos) {
  return dtos.map(function (dto) {
    var separator = ['{', parseInt(API_VERSION), dto.type, dto.timestamp].join('^') + '}';
    var newDto = {};
    for (var key in dto) {
        if( key !== 'type' && key !== 'timestamp' )
            newDto[key] = dto[key];
    }

    return JSON.stringify(newDto) + separator;
  }).join('');
};

//builds URL according to CDS specs
var buildURL = function (dtos) {
  var errors = 0,
      events = 0,
      baseURL = config.getOption('baseURL');

  dtos.map(function (dto) {
    if (dto.stacktrace || dto.errorHash || dto.klass) {
      errors++;
    } else {
      events++;
    }
  });

  return [baseURL, API_VERSION, config.getOption('apiKey'), config.getOption('uuid'), errors, events].join('/');
};

var dispatchData = function (dtos) {
  var url = buildURL(dtos);
  var data = bundleDTOs(dtos);

  sendData(url, data, dtos);
};

//sends data on window.unload
//Uses sendBeacon because asynchronous POST will not work for window.unload
var sendFinalData = function (dtos) {
  var url = buildURL(dtos);
  var data = bundleDTOs(dtos);
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, data);
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('post', url, false);
    xhr.send(data);
  }
};

exports.dispatchData = dispatchData;
exports.bundleDTOs = bundleDTOs;
exports.sendFinalData = sendFinalData;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

/* global WEBPACK_DEFINE_PRODUCTION */

var _ = __webpack_require__(3);
var Lockr = __webpack_require__(27);
var dispatcher = __webpack_require__(10);
var queue = [];

var save = function (data) {
  if(Array.isArray(data)) {
    queue = queue.concat(data);
  } else {
    queue.push(data);
  }

  update();
};

var update = function () {
  Lockr.set('mintjs:cache', queue);
};

var retrieve = function () {
  queue = _.union(Lockr.get('mintjs:cache', []), queue);
  return queue;
};

var dispatchCache = function () {
  if(queue.length === 0) {
    return;
  }

  dispatcher.dispatchData(queue);
  Lockr.set('mintjs:cache', []);
  queue = [];
};

if(false) {
  // make this available in non-prod env to assist running test cases
  window.__cacheRetrieve = retrieve
}

exports.save = save;
exports.retrieve = retrieve;
exports.dispatchCache = dispatchCache;



/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/*!
* MinPubSub
* Copyright(c) 2011 Daniel Lamb <daniellmb.com>
* MIT Licensed
*/

(function(d){
	var MinPubSub = {};

	// the topic/subscription hash
	var cache = d.c_ || {}; //check for "c_" cache for unit testing
	
	MinPubSub.publish = function(/* String */ topic, /* Array? */ args){
		// summary: 
		//		Publish some data on a named topic.
		// topic: String
		//		The channel to publish on
		// args: Array?
		//		The data to publish. Each array item is converted into an ordered
		//		arguments on the subscribed functions. 
		//
		// example:
		//		Publish stuff on '/some/topic'. Anything subscribed will be called
		//		with a function signature like: function(a,b,c){ ... }
		//
		//		publish("/some/topic", ["a","b","c"]);
		
		var subs = cache[topic],
			len = subs ? subs.length : 0;

		//can change loop or reverse array if the order matters
		while(len--){
			subs[len].apply(d, args || []);
		}
	};

	MinPubSub.subscribe = function(/* String */ topic, /* Function */ callback){
		// summary:
		//		Register a callback on a named topic.
		// topic: String
		//		The channel to subscribe to
		// callback: Function
		//		The handler event. Anytime something is publish'ed on a 
		//		subscribed channel, the callback will be called with the
		//		published array as ordered arguments.
		//
		// returns: Array
		//		A handle which can be used to unsubscribe this particular subscription.
		//	
		// example:
		//		subscribe("/some/topic", function(a, b, c){ /* handle data */ });

		if(!cache[topic]){
			cache[topic] = [];
		}
		cache[topic].push(callback);
		return [topic, callback]; // Array
	};

	MinPubSub.unsubscribe = function(/* Array */ handle, /* Function? */ callback){
		// summary:
		//		Disconnect a subscribed function for a topic.
		// handle: Array
		//		The return value from a subscribe call.
		// example:
		//		var handle = subscribe("/some/topic", function(){});
		//		unsubscribe(handle);
		
		var subs = cache[callback ? handle : handle[0]],
			callback = callback || handle[1],
			len = subs ? subs.length : 0;
		
		while(len--){
			if(subs[len] === callback){
				subs.splice(len, 1);
			}
		}
	};

	// UMD definition to allow for CommonJS, AMD and legacy window
  if (typeof module === 'object' && typeof module.exports === 'object') {
      // CommonJS, just export
      module.exports = exports = MinPubSub;
  } else if (true) {
      // AMD support
      !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return MinPubSub; }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  } else if (typeof window === 'object') {
      // If no AMD and we are in the browser, attach to window
      window.publish = MinPubSub.publish;
      window.subscribe = MinPubSub.subscribe;
      window.unsubscribe = MinPubSub.unsubscribe;
  }

})(window);

/***/ }),
/* 13 */
/***/ (function(module, exports) {

// #todo consider adding object instead array for faster lookup
var url_blacklist = [];
var pattern_blacklist = [];


function clearURLBlackList () {
  url_blacklist = [];
}

function clearURLBlackListPattern () {
  pattern_blacklist = [];
}

//Public method to add specific urls (Ex: http://www.splunk.com/abc/xyz) to blacklist
//Network DTO will not capture the data with these URLs
var addURLToBlackList = function (url) {
  for(var i = 0; i < url_blacklist; i++) {
    if (url_blacklist[i] === url) {
      break;
    }
  }
  url_blacklist.push(url);
};

//check if url is blacklisted
var isURLBlackListed = function (url) {
  return (url_blacklist.indexOf(url) > -1);
};

//Public method to add a url pattern (Ex: splunk.com/ab) to blacklist
//Network DTO will not capture the data with these URL patterns
var addURLPatternToBlackList = function (pattern) {
  for(var i = 0; i < pattern_blacklist.length; i++) {
    if (pattern_blacklist[i] === pattern) {
      break;
    }
  }
  pattern_blacklist.push(pattern);
};

//check if a url pattern is blacklisted
var isURLPatternBlackListed = function (url) {
  var isListed = false;
  for(var i = 0; i < pattern_blacklist.length; i++) {
    if(url.indexOf(pattern_blacklist[i]) > -1){
      isListed = true;
    }
  }
  return isListed;
};

//public method that returns all the blacklisted urls and url patterns as a string
var blackListedURLs = function () {
  var urls = 'URLs: ';
  var i;
  if(url_blacklist.length > 0) {
    urls += '[';
    for(i = 0; i < url_blacklist.length; i++) {
      urls += url_blacklist[i] + ', ';
    }
    urls = urls.slice(0, -2) + '], ';
  } else {
    urls += '[], ';
  }
  urls += 'URL Patterns: ';
  if(pattern_blacklist.length > 0) {
    urls += '[';
    for(i = 0; i < pattern_blacklist.length; i++) {
      urls += pattern_blacklist[i] + ', ';
    }
    urls = urls.slice(0, -2) + ']';
  } else {
    urls += '[]';
  }

  return urls;
};

exports.addURLToBlackList = addURLToBlackList;
exports.isURLBlackListed = isURLBlackListed;
exports.addURLPatternToBlackList = addURLPatternToBlackList;
exports.isURLPatternBlackListed = isURLPatternBlackListed;
exports.blackListedURLs = blackListedURLs;

exports.clearURLBlackList = clearURLBlackList;
exports.clearURLBlackListPattern = clearURLBlackListPattern;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/*eslint-disable no-console */
var md5 = __webpack_require__(30);
var factory = __webpack_require__(0);
var BREADCRUMB_CACHE = 15;
var pubsub = __webpack_require__(12);
var config = __webpack_require__(1);

var breadcrumbs = [];

var computeErrorHash = function (exception) {
  var string = [exception.lineNumber, exception.message, exception.klass, config.getOption('appVersion')].filter(
    function(v) { return !!v; }
  ).join('');
  return md5(string);
};

//#todo check behavior of breadcrumb in mobile sdk.. here we are not sending crumb back home.. should we be sending?
var logBreadcrumb = function (breadcrumb) {

  if(typeof breadcrumb !== 'string') {
    console.warn('logBreadcrumb: breadcrumb must be a string!');
    return;
  }

  if (breadcrumbs.length + 1 === (BREADCRUMB_CACHE + 1)) {
    breadcrumbs = breadcrumbs.slice(1);
  }
  breadcrumbs.push(breadcrumb);
};

var getBreadcrumbs = function () {
  return breadcrumbs;
};

var clearBreadcrumbs = function() {
  breadcrumbs = [];
};

var logException = function (exception, extraData, isHandled) {
  // parse stacktrace for MINT
  isHandled = isHandled === undefined ? true : isHandled;
  if(!exception) {
    exception = {};
  }

  if(typeof exception === 'string') {
    exception = {
      name: exception,
      message: exception,
      stack: 'NA'
    };
  }

  var error = {
    klass: exception.name,
    message: exception.message,
    stacktrace: exception.stack,
    handled: isHandled
  };

  error.errorHash = computeErrorHash(exception);

  if(extraData) {
    error.extraData = extraData;
  }

  // attach breadcrumbs on each exception
  var breadcrumbs = getBreadcrumbs();
  if(breadcrumbs && breadcrumbs.length > 0) {
    error.breadcrumbs = breadcrumbs;
  }

  pubsub.publish('mintjs:cancel_transaction', [error.errorHash]);

  return factory('error', error);
};

exports.logException = logException;
exports.logBreadcrumb = logBreadcrumb;
exports.getBreadcrumbs = getBreadcrumbs;
exports.clearBreadcrumbs = clearBreadcrumbs;



/***/ }),
/* 15 */
/***/ (function(module, exports) {

var charenc = {
  // UTF-8 encoding
  utf8: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      return charenc.bin.stringToBytes(unescape(encodeURIComponent(str)));
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      return decodeURIComponent(escape(charenc.bin.bytesToString(bytes)));
    }
  },

  // Binary encoding
  bin: {
    // Convert a string to a byte array
    stringToBytes: function(str) {
      for (var bytes = [], i = 0; i < str.length; i++)
        bytes.push(str.charCodeAt(i) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a string
    bytesToString: function(bytes) {
      for (var str = [], i = 0; i < bytes.length; i++)
        str.push(String.fromCharCode(bytes[i]));
      return str.join('');
    }
  }
};

module.exports = charenc;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

var factory = __webpack_require__(0);

//tracks console log statements
// level: error | warn | log | info
var logConsole = function (content, level) {
  var log = {
    content: content,
    level: level || 'log'
  };

  return factory('log', log);
};

module.exports = logConsole;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

function mintFactory() {
  var Mint;
  try {
    // this works only for automation code and not with public APIs since pub APIs are executed in user context
    //#todo wrap each pub APIs with try {} catch{}
    Mint = __webpack_require__(18);
  } catch(e) {
    // suppress Mint Errors #todo send out special Error DTO to API.relay which for Mint metrics tracking..
    if(Mint) {
      Mint.logException(e);
    }
  }

  return Mint;
}

module.exports = mintFactory();



/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* global WEBPACK_DEFINE_PRODUCTION */


var sessions = __webpack_require__(19);
var transactions = __webpack_require__(28);
var timers = __webpack_require__(29);
var extra = __webpack_require__(5);
var formatters = __webpack_require__(7);
var cache = __webpack_require__(11);
var url_blacklist = __webpack_require__(13);
var factory = __webpack_require__(0);
var errors = __webpack_require__(14);
var handlers = __webpack_require__(33);
var config = __webpack_require__(1);



var Mint = {};

var initAndStartSession = function(newOptions) {

  try {
    newOptions = newOptions || {};
    var derivedOptions = config.deriveOptions(newOptions, config.getDefaultOptions());
    derivedOptions = config.validateOptions(derivedOptions);
    derivedOptions.session_id = Mint.startSession();
    handlers.init();

    //send DTOs that were stored in cache because of any AJAX failure
    cache.retrieve();
    cache.dispatchCache();
  } catch(e) {
    Mint.logException(e);
  }
  Mint.version = config.getOption('sdkVersion');
};

var updateOptions = function (newOptions) {
  var options = config.deriveOptions(newOptions, config.getOptions());
  config.validateOptions(options);
  handlers.init();
};


Mint.getMintUUID = function () {
  return config.getOption('uuid');
};

Mint.flush = function () {
  factory();
};

Mint.getOption = config.getOption;

//public method to set a user identifier
Mint.setUserIdentifier = function (userIdentifier) {
  var options = config.getOptions();
  var defaults = config.getDefaultOptions();
  options.session_id ? options.userIdentifier = userIdentifier : defaults.userIdentifier = userIdentifier;
};

//public method to set a package name
Mint.setPackageName = function (packageName) {
  var options = config.getOptions();
  var defaults = config.getDefaultOptions();
  options.session_id ? options.packageName = packageName : defaults.packageName = packageName;
};

//public method to set an application environment
Mint.setAppEnvironment = function (appEnvironment) {
  var options = config.getOptions();
  var defaults = config.getDefaultOptions();
  options.session_id ? options.appEnvironment = appEnvironment : defaults.appEnvironment = appEnvironment;
};

//handle remaining DTOs on unload
window.addEventListener('unload', function(event) {
  factory('unload');
});

// Public API assignments
Mint.startSession = sessions.startSession;
Mint.closeSession = sessions.closeSession;
Mint.transactionStart = transactions.transactionStart;
Mint.transactionStop = transactions.transactionStop;
Mint.transactionCancel = transactions.transactionCancel;
Mint.addURLToBlackList = url_blacklist.addURLToBlackList;
Mint.addURLPatternToBlackList = url_blacklist.addURLPatternToBlackList;
Mint.clearURLBlackList = url_blacklist.clearURLBlackList;
Mint.clearURLBlackListPattern = url_blacklist.clearURLBlackListPattern;
Mint.blackListedURLs = url_blacklist.blackListedURLs;
Mint.logEvent = __webpack_require__(39);
Mint.getExtraData = extra.getExtraData;
Mint.addExtraData = extra.addExtraData;
Mint.clearExtraData = extra.clearExtraData;
Mint.removeExtraData = extra.removeExtraData;
Mint.attachFormatter = formatters.attachFormatter;
Mint.callFormatter = formatters.callFormatter;
Mint.logConsole = __webpack_require__(16);
Mint.getBreadcrumbs = errors.getBreadcrumbs;
Mint.logException = errors.logException;
Mint.logBreadcrumb = errors.logBreadcrumb;
Mint.clearBreadcrumbs = errors.clearBreadcrumbs;
Mint.timerStart = timers.timerStart;
Mint.timerStop = timers.timerStop;

Mint.initAndStartSession = initAndStartSession;
Mint.updateOptions = updateOptions;

if(false) {
  // expose dev only method to hard reset handlers
  Mint.resetHandlers = handlers.reset;
}

module.exports = Mint;



/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

var session_id = __webpack_require__(4);
var timestamp = __webpack_require__(2);
var factory = __webpack_require__(0);
var Cookies = __webpack_require__(9);
var SESSION_30_MINS = 1800000;

// startSession is called on every page load. If the user is inactive for the last 30 mins,
// it will close the session using closeSession() and sends a 'gnip' DTO,
// starts a new session and sends a 'ping' DTO
// Session is stored as a cookie 
var startSession = function () {
  var session = {};

  if(typeof Cookies.get('session') !== 'undefined'){
    var current_time = timestamp();
    session = Cookies.getJSON('session');
    session.session_id = decodeURIComponent(session.session_id);
    session.lastActive = decodeURIComponent(session.lastActive);
    session.startTime = decodeURIComponent(session.startTime);
    if(current_time - session.lastActive > SESSION_30_MINS){
      closeSession();
      startSession();
    } else {
      session.lastActive = current_time;
      Cookies.set('session', session);
      factory('ping', session);
    }
  } else {
    session = {};
    session.session_id = session_id();
    session.startTime = timestamp();
    session.lastActive = session.startTime;
    factory('ping', session);
    Cookies.set('session', session);
  }
  //Mint.flush();
  factory();
  return session.session_id;
};

//closes session and sends a 'gnip' DTO
var closeSession = function() {
  var session = Cookies.getJSON('session');
  var current_time;
  if(typeof session !== 'undefined') {
    current_time = timestamp();
    session.ses_duration = current_time - session.startTime;
    factory('gnip', session);
    Cookies.remove('session');

    //Mint.flush();
    factory();

    return session.session_id;
  }
};

exports.startSession = startSession;
exports.closeSession = closeSession;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(module, global) {var __WEBPACK_AMD_DEFINE_RESULT__;/*!
 * Platform.js <https://mths.be/platform>
 * Copyright 2014-2018 Benjamin Tan <https://bnjmnt4n.now.sh/>
 * Copyright 2011-2013 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <https://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object`. */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object. */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object. */
  var oldRoot = root;

  /** Detect free variable `exports`. */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module`. */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root`. */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Regular expression to detect Opera. */
  var reOpera = /\bOpera/;

  /** Possible global object. */
  var thisBinding = this;

  /** Used for native method references. */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values. */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // Platform tokens are defined at:
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '10.0': '10',
      '6.4':  '10 Technical Preview',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // Detect Windows version from platform tokens.
    if (pattern && label && /^Win/i.test(os) && !/^Windows Phone /i.test(os) &&
        (data = data[/[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // Correct character case and cleanup string.
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .replace(/\b(Chrome OS \w+) [\d.]+\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object. */
    var context = root;

    /** Used to flag when a custom context is provided. */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // Juggle arguments.
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object. */
    var nav = context.navigator || {};

    /** Browser user agent string. */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope]. */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome. */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts. */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environments. */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino. */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha. */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta. */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object. */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based).
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]`. */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime. */
    var data;

    /** The CPU architecture. */
    var arch = ua;

    /** Platform description array. */
    var description = [];

    /** Platform alpha/beta indicator. */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform. */
    var useFeatures = ua == userAgent;

    /** The browser/environment version. */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important). */
    var layout = getLayout([
      { 'label': 'EdgeHTML', 'pattern': 'Edge' },
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important). */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Electron',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      { 'label': 'Microsoft Edge', 'pattern': 'Edge' },
      'Midori',
      'Nook Browser',
      'PaleMoon',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      { 'label': 'Samsung Internet', 'pattern': 'SamsungBrowser' },
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'Sunrise',
      'Swiftfox',
      'Waterfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'Firefox for iOS', 'pattern': 'FxiOS' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important). */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      { 'label': 'Galaxy S5', 'pattern': 'SM-G900' },
      { 'label': 'Galaxy S6', 'pattern': 'SM-G920' },
      { 'label': 'Galaxy S6 Edge', 'pattern': 'SM-G925' },
      { 'label': 'Galaxy S7', 'pattern': 'SM-G930' },
      { 'label': 'Galaxy S7 Edge', 'pattern': 'SM-G935' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nexus',
      'Nook',
      'PlayBook',
      'PlayStation Vita',
      'PlayStation',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers. */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Archos': {},
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1, 'Nexus': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable operating systems (order is important). */
    var os = getOS([
      'Windows Phone',
      'Android',
      'CentOS',
      { 'label': 'Chrome OS', 'pattern': 'CrOS' },
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'OpenBSD',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Tizen',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // Lookup the manufacturer by product or scan the UA for the manufacturer.
        return result || (
          value[product] ||
          value[/^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + ' *\\w+-[\\w]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // Split by forward slash and append product version if needed.
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // Correct character case and cleanup string.
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // Convert layout to an array so we can add extra details.
    layout && (layout = [layout]);

    // Detect product names that contain their manufacturer's name.
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // Clean up Google TV.
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // Detect simulators.
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // Detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS.
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // Detect IE Mobile 11.
    if (name == 'IE' && /\blike iPhone OS\b/.test(ua)) {
      data = parse(ua.replace(/like iPhone OS/, ''));
      manufacturer = data.manufacturer;
      product = data.product;
    }
    // Detect iOS.
    else if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // Detect Kubuntu.
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // Detect Android browsers.
    else if ((manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) ||
        (/\bAndroid\b/.test(os) && /^Chrome/.test(name) && /\bVersion\//i.test(ua))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // Detect Silk desktop/accelerated modes.
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // Detect PaleMoon identifying as Firefox.
    else if (name == 'PaleMoon' && (data = /\bFirefox\/([\d.]+)\b/.exec(ua))) {
      description.push('identifying as Firefox ' + data[1]);
    }
    // Detect Firefox OS and products running Firefox.
    else if (name == 'Firefox' && (data = /\b(Mobile|Tablet|TV)\b/i.exec(ua))) {
      os || (os = 'Firefox OS');
      product || (product = data[1]);
    }
    // Detect false positives for Firefox/Safari.
    else if (!name || (data = !/\bMinefield\b/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // Escape the `/` for Firefox 1.
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // Clear name of false positives.
        name = null;
      }
      // Reassign a generic name.
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // Add Chrome version to description for Electron.
    else if (name == 'Electron' && (data = (/\bChrome\/([\d.]+)\b/.exec(ua) || 0)[1])) {
      description.push('Chromium ' + data);
    }
    // Detect non-Opera (Presto-based) versions (order is important).
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|Edge|FxiOS|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|SamsungBrowser|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // Detect stubborn layout engines.
    if ((data =
          layout == 'iCab' && parseFloat(version) > 3 && 'WebKit' ||
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && !/^(?:Trident|EdgeHTML)$/.test(layout) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident') ||
          layout == 'WebKit' && /\bPlayStation\b(?! Vita\b)/i.test(name) && 'NetFront'
        )) {
      layout = [data];
    }
    // Detect Windows Phone 7 desktop mode.
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // Detect Windows Phone 8.x desktop mode.
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8.x';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // Detect IE 11 identifying as other browsers.
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (name) {
        description.push('identifying as ' + name + (version ? ' ' + version : ''));
      }
      name = 'IE';
      version = data[1];
    }
    // Leverage environment features.
    if (useFeatures) {
      // Detect server-side environments.
      // Rhino has a global function while others have a global object.
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (rhino) {
          try {
            version = context.require('ringo/engine').version.join('.');
            name = 'RingoJS';
          } catch(e) {
            if ((data = context.system) && data.global.system == context.system) {
              name = 'Narwhal';
              os || (os = data[0].os || null);
            }
          }
          if (!name) {
            name = 'Rhino';
          }
        }
        else if (
          typeof context.process == 'object' && !context.process.browser &&
          (data = context.process)
        ) {
          if (typeof data.versions == 'object') {
            if (typeof data.versions.electron == 'string') {
              description.push('Node ' + data.versions.node);
              name = 'Electron';
              version = data.versions.electron;
            } else if (typeof data.versions.nw == 'string') {
              description.push('Chromium ' + version, 'Node ' + data.versions.node);
              name = 'NW.js';
              version = data.versions.nw;
            }
          }
          if (!name) {
            name = 'Node.js';
            arch = data.arch;
            os = data.platform;
            version = /[\d.]+/.exec(data.version);
            version = version ? version[0] : null;
          }
        }
      }
      // Detect Adobe AIR.
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // Detect PhantomJS.
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // Detect IE compatibility modes.
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // We're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode.
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      // Detect IE 11 masking as other browsers.
      else if (typeof doc.documentMode == 'number' && /^(?:Chrome|Firefox)\b/.test(name)) {
        description.push('masking as ' + name + ' ' + version);
        name = 'IE';
        version = '11.0';
        layout = ['Trident'];
        os = 'Windows';
      }
      os = os && format(os);
    }
    // Detect prerelease phases.
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // Detect Firefox Mobile.
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // Obscure Maxthon's unreliable version.
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // Detect Xbox 360 and Xbox One.
    else if (/\bXbox\b/i.test(product)) {
      if (product == 'Xbox 360') {
        os = null;
      }
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // Add mobile postfix.
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // Detect IE platform preview.
    else if (name == 'IE' && useFeatures) {
      try {
        if (context.external === null) {
          description.unshift('platform preview');
        }
      } catch(e) {
        description.unshift('embedded');
      }
    }
    // Detect BlackBerry OS version.
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // Detect Opera identifying/masking itself as another browser.
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && product != 'Wii' && (
          (useFeatures && opera) ||
          (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
          (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
          (name == 'IE' && (
            (os && !/^Win/.test(os) && version > 5.5) ||
            /\bWindows XP\b/.test(os) && version > 8 ||
            version == 8 && !/\bTrident\b/.test(ua)
          ))
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {
      // When "identifying", the UA contains both Opera and the other browser's name.
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // When "masking", the UA contains only the other browser's name.
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // Detect WebKit Nightly and approximate Chrome/Safari versions.
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // Correct build number for numeric comparison.
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // Nightly builds are postfixed with a "+".
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // Clear incorrect browser versions.
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // Use the full Chrome version when available.
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // Detect Blink layout engine.
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && layout == 'WebKit') {
        layout = ['Blink'];
      }
      // Detect JavaScriptCore.
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // Add the postfix of ".x" or "+" for approximate versions.
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // Obscure version for some Safari 1-2 releases.
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // Detect Opera desktop modes.
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // Detect Chrome desktop mode.
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // Strip incorrect OS versions.
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // Add layout engine.
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        name != 'Safari' && /^iOS/.test(os) && /\bSafari\b/.test(layout[1]) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Samsung Internet|Sleipnir|Web)/.test(name) && layout[1])) {
      // Don't add layout details to description if they are falsey.
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // Combine contextual information.
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // Append manufacturer to description.
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // Append product to description.
    if (product) {
      description.push((/^on /.test(description[description.length - 1]) ? '' : 'on ') + product);
    }
    // Parse the OS into an object.
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // Add browser/OS architecture.
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }
    // Chrome 39 and above on OS X is always 64-bit.
    else if (
        os && /^OS X/.test(os.family) &&
        name == 'Chrome' && parseFloat(version) >= 39
    ) {
      os.architecture = 64;
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * The list of common layout engines include:
     * "Blink", "EdgeHTML", "Gecko", "Trident" and "WebKit"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * The list of manufacturers include:
     * "Apple", "Archos", "Amazon", "Asus", "Barnes & Noble", "BlackBerry",
     * "Google", "HP", "HTC", "LG", "Microsoft", "Motorola", "Nintendo",
     * "Nokia", "Samsung" and "Sony"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * The list of common browser names include:
     * "Chrome", "Electron", "Firefox", "Firefox for iOS", "IE",
     * "Microsoft Edge", "PhantomJS", "Safari", "SeaMonkey", "Silk",
     * "Opera Mini" and "Opera"
     *
     * Mobile versions of some browsers have "Mobile" appended to their name:
     * eg. "Chrome Mobile", "Firefox Mobile", "IE Mobile" and "Opera Mobile"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * The list of common products include:
     *
     * "BlackBerry", "Galaxy S4", "Lumia", "iPad", "iPod", "iPhone", "Kindle",
     * "Kindle Fire", "Nexus", "Nook", "PlayBook", "TouchPad" and "Transformer"
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // Export platform.
  var platform = parse();

  // Some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (true) {
    // Expose platform on the global object to prevent errors when platform is
    // loaded by a script tag in the presence of an AMD loader.
    // See http://requirejs.org/docs/errors.html#mismatch for more details.
    root.platform = platform;

    // Define as an anonymous module so platform can be aliased through path mapping.
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
      return platform;
    }).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
  // Check for `exports` after `define` in case a build optimizer adds an `exports` object.
  else if (freeExports && freeModule) {
    // Export for CommonJS support.
    forOwn(platform, function(value, key) {
      freeExports[key] = value;
    });
  }
  else {
    // Export to the global object.
    root.platform = platform;
  }
}.call(this));

/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)(module), __webpack_require__(22)))

/***/ }),
/* 21 */
/***/ (function(module, exports) {

module.exports = function(module) {
	if(!module.webpackPolyfill) {
		module.deprecate = function() {};
		module.paths = [];
		// module.parent = undefined by default
		if(!module.children) module.children = [];
		Object.defineProperty(module, "loaded", {
			enumerable: true,
			get: function() {
				return module.l;
			}
		});
		Object.defineProperty(module, "id", {
			enumerable: true,
			get: function() {
				return module.i;
			}
		});
		module.webpackPolyfill = 1;
	}
	return module;
};


/***/ }),
/* 22 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

var Cookies = __webpack_require__(9);
var generatev4 = __webpack_require__(6);

var generateUUID = function() {
	var uuid;
	if(typeof Cookies.get('mintjs:uuid') === 'undefined'){
		uuid = generatev4();
		Cookies.set('mintjs:uuid', uuid, {expires: 365});
	} else {
		uuid = Cookies.get('mintjs:uuid');
	}
  return uuid;
}

module.exports = generateUUID;


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

var _ = __webpack_require__(3);
var baseFormatter = __webpack_require__(8);
var LEVELS = __webpack_require__(25);
var config = __webpack_require__(1);
var extra = __webpack_require__(5);

var customFormatter = {
  log: function (data, type) {
    data.extraData = extra.getExtraData();
    return _.extend(baseFormatter('log'), {log_name: data.content, level: LEVELS[data.level], extraData: data.extraData});
  },
  event: function (data, type) {
    data.level ? data.level = LEVELS[data.level] : data.level = 'NA';
    // if global extra data is set, it will be appended with the extra data set for Events
    var global_extra_data = extra.getExtraData();
    data.extraData = data.extraData !== undefined ? _.extend(data.extraData, global_extra_data) : global_extra_data;
    data.appRunningState = 'NA';
    return _.extend(baseFormatter('event'), data);
  },
  network: function (data, type) {
    var global_extra_data = extra.getExtraData();
    data.extraData = global_extra_data;
    data.appRunningState = 'NA';
    return _.extend(baseFormatter('network'), data);
  },
  ping: function (data, type) {
    var global_extra_data = extra.getExtraData();
    data.extraData = global_extra_data;
    data.fsEncrypted = 'NA';
    data.rooted = false;
    //selects only fields applicable for ping DTO
    var whitelistedFields = ['session_id', 'ses_duration', 'extraData', 'batteryLevel', 'currentView', 'fsEncrypted', 'msFromStart', 'rooted', 'screenOrientation', 'transactions'];
    return _.extend(baseFormatter('ping'), _.pick(data, whitelistedFields));
  },
  gnip: function (data, type) {
    var global_extra_data = extra.getExtraData();
    data.extraData = global_extra_data;
    data.appRunningState = 'NA';
    data.fsEncrypted = 'NA';
    data.rooted = false;
    // selects fields only applicable for gnip DTO
    var blacklistedFields = ['fsEncrypted', 'rooted']
    return _.extend(baseFormatter('gnip'), _.omit(data, blacklistedFields));
  },
  transaction: function (data, type) {
    // if global extra data is set, it will be appended with the extra data set for Transactions
    var global_extra_data = extra.getExtraData();
    data.extraData = data.extraData !== undefined ? _.extend(data.extraData, global_extra_data): global_extra_data;
    if(data.reason === 'undefined' || data.reason == undefined) { data.reason = 'NA'; }
    //selects fields only applicable for Transaction DTO
    var whitelistedFields = ['tr_name', 'transaction_id', 'tr_duration', 'reason', 'status', 'extraData'];
    return _.extend(baseFormatter(data.tr_type), _.pick(data, whitelistedFields));
  },
  timer: function (data, type) {
    // if global extra data is set, it will be appended with the extra data set for Transactions
    var global_extra_data = extra.getExtraData();
    data.extraData = data.extraData !== undefined ? _.extend(data.extraData, global_extra_data): global_extra_data;
    //selects fields only applicable for timer DTO
    var whitelistedFields = ['timer_name', 'timer_id', 'elapsed_time', 'extraData'];
    return _.extend(baseFormatter('timer'), _.pick(data, whitelistedFields));
  },
  view: function (data, type) {
    var global_extra_data = extra.getExtraData();
    data.extraData = global_extra_data;
    data.appRunningState = 'NA';
    config.getOption('current') !== undefined ? data.currentView = config.getOption('current') : data.currentView = 'NA';
    return _.extend(baseFormatter('view'), data);
  },
  display: function (data, type) {
    var global_extra_data = extra.getExtraData();
    data.extraData = global_extra_data;
    data.appRunningState = 'NA';
    config.getOption('current') !== undefined ? data.currentView = config.getOption('current') : data.currentView = 'NA';
    return _.extend(baseFormatter('display'), data);
  },
  error: function (data, type) {
    var global_extra_data = extra.getExtraData();
    data.extraData = data.extraData !== undefined ? _.extend(data.extraData, global_extra_data) : global_extra_data;
    data.memAppAvailable = 'NA';
    data.memAppMax = 'NA';
    data.memAppTotal = 'NA';
    data.memSysAvailable = 'NA';
    data.memSysLow = 'NA';
    data.memSysThreshold = 'NA';
    data.log = 'NA';
    data.where = 'NA';
    data.gpsStatus = 'NA';
    data.architecture = 'NA';
    data.buildUuid = 'NA';
    data.imageBaseAddress = 'NA';
    return _.extend(baseFormatter('error'), data);
  }
}

module.exports = customFormatter;


/***/ }),
/* 25 */
/***/ (function(module, exports) {

//levels assigned to different console statements
module.exports = {
  'error': 60,
  'warn': 50,
  'log': 40,
  'info': 40,
};



/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;/*! qwest 1.7.0 (https://github.com/pyrsmk/qwest) */

;(function(context,name,definition){
	if(typeof module!='undefined' && module.exports){
		module.exports=definition;
	}
	else if(true){
		!(__WEBPACK_AMD_DEFINE_FACTORY__ = (definition),
				__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?
				(__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) :
				__WEBPACK_AMD_DEFINE_FACTORY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	}
	else{
		context[name]=definition;
	}
}(this,'qwest',function(){

	var win=window,
		doc=document,
		before,
		// Default response type for XDR in auto mode
		defaultXdrResponseType='json',
		// Variables for limit mechanism
		limit=null,
		requests=0,
		request_stack=[],
		// Get XMLHttpRequest object
		getXHR=function(){
				return win.XMLHttpRequest?
						new XMLHttpRequest():
						new ActiveXObject('Microsoft.XMLHTTP');
			},
		// Guess XHR version
		xhr2=(getXHR().responseType===''),

	// Core function
	qwest=function(method,url,data,options,before){

		// Format
		method=method.toUpperCase();
		data=data || null;
		options=options || {};

		// Define variables
		var nativeResponseParsing=false,
			crossOrigin,
			xhr,
			xdr=false,
			timeoutInterval,
			aborted=false,
			attempts=0,
			headers={},
			mimeTypes={
				text: '*/*',
				xml: 'text/xml',
				json: 'application/json',
				post: 'application/x-www-form-urlencoded'
			},
			accept={
				text: '*/*',
				xml: 'application/xml; q=1.0, text/xml; q=0.8, */*; q=0.1',
				json: 'application/json; q=1.0, text/*; q=0.8, */*; q=0.1'
			},
			contentType='Content-Type',
			vars='',
			i,j,
			serialized,
			then_stack=[],
			catch_stack=[],
			complete_stack=[],
			response,
			success,
			error,
			func,

		// Define promises
		promises={
			then:function(func){
				if(options.async){
					then_stack.push(func);
				}
				else if(success){
					func.call(xhr,response);
				}
				return promises;
			},
			'catch':function(func){
				if(options.async){
					catch_stack.push(func);
				}
				else if(error){
					func.call(xhr,response);
				}
				return promises;
			},
			complete:function(func){
				if(options.async){
					complete_stack.push(func);
				}
				else{
					func.call(xhr);
				}
				return promises;
			}
		},
		promises_limit={
			then:function(func){
				request_stack[request_stack.length-1].then.push(func);
				return promises_limit;
			},
			'catch':function(func){
				request_stack[request_stack.length-1]['catch'].push(func);
				return promises_limit;
			},
			complete:function(func){
				request_stack[request_stack.length-1].complete.push(func);
				return promises_limit;
			}
		},

		// Handle the response
		handleResponse=function(){
			// Verify request's state
			// --- https://stackoverflow.com/questions/7287706/ie-9-javascript-error-c00c023f
			if(aborted){
				return;
			}
			// Prepare
			var i,req,p,responseType;
			--requests;
			// Clear the timeout
			clearInterval(timeoutInterval);
			// Launch next stacked request
			if(request_stack.length){
				req=request_stack.shift();
				p=qwest(req.method,req.url,req.data,req.options,req.before);
				for(i=0;func=req.then[i];++i){
					p.then(func);
				}
				for(i=0;func=req['catch'][i];++i){
					p['catch'](func);
				}
				for(i=0;func=req.complete[i];++i){
					p.complete(func);
				}
			}
			// Handle response
			try{
				// Init
				var responseText='responseText',
					responseXML='responseXML',
					parseError='parseError';
				// Process response
				if(nativeResponseParsing && 'response' in xhr && xhr.response!==null){
					response=xhr.response;
				}
				else if(options.responseType=='document'){
					var frame=doc.createElement('iframe');
					frame.style.display='none';
					doc.body.appendChild(frame);
					frame.contentDocument.open();
					frame.contentDocument.write(xhr.response);
					frame.contentDocument.close();
					response=frame.contentDocument;
					doc.body.removeChild(frame);
				}
				else{
					// Guess response type
					responseType=options.responseType;
					if(responseType=='auto'){
						if(xdr){
							responseType=defaultXdrResponseType;
						}
						else{
							var ct=xhr.getResponseHeader(contentType) || '';
							if(ct.indexOf(mimeTypes.json)>-1){
								responseType='json';
							}
							else if(ct.indexOf(mimeTypes.xml)>-1){
								responseType='xml';
							}
							else{
								responseType='text';
							}
						}
					}
					// Handle response type
					switch(responseType){
						case 'json':
							try{
								if('JSON' in win){
									response=JSON.parse(xhr[responseText]);
								}
								else{
									response=eval('('+xhr[responseText]+')');
								}
							}
							catch(e){
								throw "Error while parsing JSON body : "+e;
							}
							break;
						case 'xml':
							// Based on jQuery's parseXML() function
							try{
								// Standard
								if(win.DOMParser){
									response=(new DOMParser()).parseFromString(xhr[responseText],'text/xml');
								}
								// IE<9
								else{
									response=new ActiveXObject('Microsoft.XMLDOM');
									response.async='false';
									response.loadXML(xhr[responseText]);
								}
							}
							catch(e){
								response=undefined;
							}
							if(!response || !response.documentElement || response.getElementsByTagName('parsererror').length){
								throw 'Invalid XML';
							}
							break;
						default:
							response=xhr[responseText];
					}
				}
				// Late status code verification to allow data when, per example, a 409 is returned
				// --- https://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
				if('status' in xhr && !/^2|1223/.test(xhr.status)){
					throw xhr.status+' ('+xhr.statusText+')';
				}
				// Execute 'then' stack
				success=true;
				p=response;
				if(options.async){
					for(i=0;func=then_stack[i];++i){
						p=func.call(xhr, p);
					}
				}
			}
			catch(e){
				error=true;
				// Execute 'catch' stack
				if(options.async){
					for(i=0;func=catch_stack[i];++i){
						func.call(xhr, e, response);
					}
				}
			}
			// Execute complete stack
			if(options.async){
				for(i=0;func=complete_stack[i];++i){
					func.call(xhr, response);
				}
			}
		},

		// Handle errors
		handleError= function(e){
			error=true;
			--requests;
			// Clear the timeout
			clearInterval(timeoutInterval);
			// Execute 'catch' stack
			if(options.async){
				for(i=0;func=catch_stack[i];++i){
					func.call(xhr, e, null);
				}
			}
		},

		// Recursively build the query string
		buildData=function(data,key){
			var res=[],
				enc=encodeURIComponent,
				p;
			if(typeof data==='object' && data!=null) {
				for(p in data) {
					if(data.hasOwnProperty(p)) {
						var built=buildData(data[p],key?key+'['+p+']':p);
						if(built!==''){
							res=res.concat(built);
						}
					}
				}
			}
			else if(data!=null && key!=null){
				res.push(enc(key)+'='+enc(data));
			}
			return res.join('&');
		};

		// New request
		++requests;

		if ('retries' in options) {
			if (win.console && console.warn) {
				console.warn('[Qwest] The retries option is deprecated. It indicates total number of requests to attempt. Please use the "attempts" option.');
			}
			options.attempts = options.retries;
		}

		// Normalize options
		options.async='async' in options?!!options.async:true;
		options.cache='cache' in options?!!options.cache:(method!='GET');
		options.dataType='dataType' in options?options.dataType.toLowerCase():'post';
		options.responseType='responseType' in options?options.responseType.toLowerCase():'auto';
		options.user=options.user || '';
		options.password=options.password || '';
		options.withCredentials=!!options.withCredentials;
		options.timeout='timeout' in options?parseInt(options.timeout,10):30000;
		options.attempts='attempts' in options?parseInt(options.attempts,10):1;

		// Guess if we're dealing with a cross-origin request
		i=url.match(/\/\/(.+?)\//);
		crossOrigin=i && i[1]?i[1]!=location.host:false;

		// Prepare data
		if('ArrayBuffer' in win && data instanceof ArrayBuffer){
			options.dataType='arraybuffer';
		}
		else if('Blob' in win && data instanceof Blob){
			options.dataType='blob';
		}
		else if('Document' in win && data instanceof Document){
			options.dataType='document';
		}
		else if('FormData' in win && data instanceof FormData){
			options.dataType='formdata';
		}
		switch(options.dataType){
			case 'json':
				data=JSON.stringify(data);
				break;
			case 'post':
				data=buildData(data);
		}

		// Prepare headers
		if(options.headers){
			var format=function(match,p1,p2){
				return p1+p2.toUpperCase();
			};
			for(i in options.headers){
				headers[i.replace(/(^|-)([^-])/g,format)]=options.headers[i];
			}
		}
		if(!headers[contentType] && method!='GET'){
			if(options.dataType in mimeTypes){
				if(mimeTypes[options.dataType]){
					headers[contentType]=mimeTypes[options.dataType];
				}
			}
		}
		if(!headers.Accept){
			headers.Accept=(options.responseType in accept)?accept[options.responseType]:'*/*';
		}
		if(!crossOrigin && !headers['X-Requested-With']){ // because that header breaks in legacy browsers with CORS
			headers['X-Requested-With']='XMLHttpRequest';
		}

		// Prepare URL
		if(method=='GET' && data){
			vars+=data;
		}
		if(!options.cache){
			if(vars){
				vars+='&';
			}
			vars+='__t='+(+new Date());
		}
		if(vars){
			url+=(/\?/.test(url)?'&':'?')+vars;
		}

		// The limit has been reached, stock the request
		if(limit && requests==limit){
			request_stack.push({
				method	: method,
				url		: url,
				data	: data,
				options	: options,
				before	: before,
				then	: [],
				'catch'	: [],
				complete: []
			});
			return promises_limit;
		}

		// Send the request
		var send=function(){
			// Get XHR object
			xhr=getXHR();
			if(crossOrigin){
				if(!('withCredentials' in xhr) && win.XDomainRequest){
					xhr=new XDomainRequest(); // CORS with IE8/9
					xdr=true;
					if(method!='GET' && method!='POST'){
						method='POST';
					}
				}
			}
			// Open connection
			if(xdr){
				xhr.open(method,url);
			}
			else{
				xhr.open(method,url,options.async,options.user,options.password);
				if(xhr2 && options.async){
					xhr.withCredentials=options.withCredentials;
				}
			}
			// Set headers
			if(!xdr){
				for(var i in headers){
					xhr.setRequestHeader(i,headers[i]);
				}
			}
			// Verify if the response type is supported by the current browser
			if(xhr2 && options.responseType!='document' && options.responseType!='auto'){ // Don't verify for 'document' since we're using an internal routine
				try{
					xhr.responseType=options.responseType;
					nativeResponseParsing=(xhr.responseType==options.responseType);
				}
				catch(e){}
			}
			// Plug response handler
			if(xhr2 || xdr){
				xhr.onload=handleResponse;
				xhr.onerror=handleError;
			}
			else{
				xhr.onreadystatechange=function(){
					if(xhr.readyState==4){
						handleResponse();
					}
				};
			}
			// Override mime type to ensure the response is well parsed
			if(options.responseType!='auto' && 'overrideMimeType' in xhr){
				xhr.overrideMimeType(mimeTypes[options.responseType]);
			}
			// Run 'before' callback
			if(before){
				before.call(xhr);
			}
			// Send request
			if(xdr){
				setTimeout(function(){ // https://developer.mozilla.org/en-US/docs/Web/API/XDomainRequest
					xhr.send(method!='GET'?data:null);
				},0);
			}
			else{
				xhr.send(method!='GET'?data:null);
			}
		};

		// Timeout/attempts
		var timeout=function(){
			timeoutInterval=setTimeout(function(){
				aborted=true;
				xhr.abort();
				if(!options.attempts || ++attempts!=options.attempts){
					aborted=false;
					timeout();
					send();
				}
				else{
					aborted=false;
					error=true;
					response='Timeout ('+url+')';
					if(options.async){
						for(i=0;func=catch_stack[i];++i){
							func.call(xhr,response);
						}
					}
				}
			},options.timeout);
		};

		// Start the request
		timeout();
		send();

		// Return promises
		return promises;

	};

	// Return external qwest object
	var create=function(method){
			return function(url,data,options){
				var b=before;
				before=null;
				return qwest(method,this.base+url,data,options,b);
			};
		},
		obj={
            base: '',
			before: function(callback){
				before=callback;
				return obj;
			},
			get: create('GET'),
			post: create('POST'),
			put: create('PUT'),
			'delete': create('DELETE'),
			xhr2: xhr2,
			limit: function(by){
				limit=by;
			},
			setDefaultXdrResponseType: function(type){
				defaultXdrResponseType=type.toLowerCase();
			}
		};
	return obj;

}()));


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

(function(root, factory) {

  if (true) {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = factory(root, exports);
    }
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], function(exports) {
      root.Lockr = factory(root, exports);
    });
  } else {
    root.Lockr = factory(root, {});
  }

}(this, function(root, Lockr) {
  'use strict';

  if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
      var len = this.length >>> 0;

      var from = Number(arguments[1]) || 0;
      from = (from < 0)
      ? Math.ceil(from)
      : Math.floor(from);
      if (from < 0)
        from += len;

      for (; from < len; from++)
      {
        if (from in this &&
            this[from] === elt)
          return from;
      }
      return -1;
    };
  }

  Lockr.prefix = "";

  Lockr._getPrefixedKey = function(key, options) {
    options = options || {};

    if (options.noPrefix) {
      return key;
    } else {
      return this.prefix + key;
    }

  };

  Lockr.set = function (key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    try {
      localStorage.setItem(query_key, JSON.stringify({"data": value}));
    } catch (e) {
      if (console) console.warn("Lockr didn't successfully save the '{"+ key +": "+ value +"}' pair, because the localStorage is full.");
    }
  };

  Lockr.get = function (key, missing, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
        try {
            if(localStorage[query_key]) {
                value = JSON.parse('{"data":"' + localStorage.getItem(query_key) + '"}');
            } else{
                value = null;
            }
        } catch (e) {
            if (console) console.warn("Lockr could not load the item with key " + key);
        }
    }
    if(value === null) {
      return missing;
    } else if (typeof value.data !== 'undefined') {
      return value.data;
    } else {
      return missing;
    }
  };

  Lockr.sadd = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json;

    var values = Lockr.smembers(key);

    if (values.indexOf(value) > -1) {
      return null;
    }

    try {
      values.push(value);
      json = JSON.stringify({"data": values});
      localStorage.setItem(query_key, json);
    } catch (e) {
      console.log(e);
      if (console) console.warn("Lockr didn't successfully add the "+ value +" to "+ key +" set, because the localStorage is full.");
    }
  };

  Lockr.smembers = function(key, options) {
    var query_key = this._getPrefixedKey(key, options),
        value;

    try {
      value = JSON.parse(localStorage.getItem(query_key));
    } catch (e) {
      value = null;
    }

    if (value === null)
      return [];
    else
      return (value.data || []);
  };

  Lockr.sismember = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options);

    return Lockr.smembers(key).indexOf(value) > -1;
  };

  Lockr.getAll = function () {
    var keys = Object.keys(localStorage);

    return keys.map(function (key) {
      return Lockr.get(key);
    });
  };

  Lockr.srem = function(key, value, options) {
    var query_key = this._getPrefixedKey(key, options),
        json,
        index;

    var values = Lockr.smembers(key, value);

    index = values.indexOf(value);

    if (index > -1)
      values.splice(index, 1);

    json = JSON.stringify({"data": values});

    try {
      localStorage.setItem(query_key, json);
    } catch (e) {
      if (console) console.warn("Lockr couldn't remove the "+ value +" from the set "+ key);
    }
  };

  Lockr.rm =  function (key) {
    localStorage.removeItem(key);
  };

  Lockr.flush = function () {
    localStorage.clear();
  };
  return Lockr;

}));


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

var session_id = __webpack_require__(4);
var timestamp = __webpack_require__(2);
var pubsub = __webpack_require__(12);
var factory = __webpack_require__(0);

var transactions = [];

var Transaction = function(name, extraData) {
  this.tr_name = name;
  this.transaction_id = session_id();
  this._milliStart = timestamp();
  this.tr_type = 'trstart';
  if(extraData){
    this.extraData = extraData;
  }
  sendTransaction(this);
};

Transaction.prototype.stop = function (status, reason) {
  this.status = status;
  this.reason = reason;
  this.tr_duration = timestamp() - this._milliStart;
  this.tr_type = 'trstop';

  sendTransaction(this);
  destroyTransaction(this.transaction_id);
};

var transactionStart = function (name, extraData) {
  var transaction = findTransaction(name);
  if (transaction) {
    return transaction;
  }

  if(extraData){
    transaction = new Transaction(name, extraData);
  } else {
    transaction = new Transaction(name);
  }

  transactions.push(transaction);

  return transaction;
};

var transactionStop = function (name, extraData) {
  var transaction = findTransaction(name);

  if (transaction) {
    if(extraData){
      transaction.extraData = extraData;
    }
    transaction.stop('SUCCESS');

    return transaction;
  } else {
    return undefined;
  }
};

var transactionCancel = function (name, reason, extraData) {

  var transaction = findTransaction(name);

  if (transaction) {
    if(extraData !== null && typeof(extraData) === 'object'){
      transaction.extraData = extraData;
    }
    transaction.stop('CANCEL', reason);
    return transaction;
  } else {
    return undefined;
  }
};

var sendTransaction = function (transaction) {
  factory('transaction', transaction);
};

var findTransaction = function (name) {
  for( var i = 0; i < transactions.length; i++ ) {
      if (transactions[i].tr_name === name) {
          return transactions[i];
      }
  }
  return undefined;
};

var destroyTransaction = function (id) {
  transactions = transactions.filter( function (transaction) {
    return transaction.transaction_id !== id;
  });
};


var errorHappened = function (errorHash) {

  transactions.map( function (transaction) {
    transaction.stop('FAIL', errorHash);
  });
};

pubsub.subscribe('mintjs:cancel_transaction', errorHappened);

exports.transactionStart = transactionStart;
exports.transactionStop = transactionStop;
exports.transactionCancel = transactionCancel;


/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

var session_id = __webpack_require__(4);
var timestamp = __webpack_require__(2);
var factory = __webpack_require__(0);

var timers = [];


function getTimeStamp() {
  return window.performance ? performance.now() : timestamp();
}

var sendTimer = function (timer) {
  factory('timer', timer);
};

var findTimer = function (name) {
  for( var i = 0; i < timers.length; i++ ) {
    if (timers[i].tr_name === name) {
      return timers[i];
    }
  }
  return undefined;
};

var findTimerById = function (id) {
  for( var i = 0; i < timers.length; i++ ) {
    if (timers[i].timer_id === id) {
      return timers[i];
    }
  }
  return undefined;
};

var destroyTimer = function (id) {
  timers = timers.filter( function (timer) {
    return timer.timer_id !== id;
  });
};

var Timer = function(name, extraData) {
  this.timer_name = name;
  this.timer_id = session_id();
  this._milliStart = getTimeStamp();
  if(extraData){
    this.extraData = extraData;
  }
};

Timer.prototype.stop = function () {
  this.elapsed_time = getTimeStamp() - this._milliStart;

  sendTimer(this);
  destroyTimer(this.timer_id);
};

var timerStart = function (name) {
  var timer = findTimer(name);
  if (timer) {
    return timer.timer_id;
  }
  timer = new Timer(name);
  timers.push(timer);

  return timer.timer_id;
};

var timerStop = function (id) {
  var timer = findTimerById(id);

  if (timer) {
    timer.stop();
  }
};

var timerCancel = function (name) {

  var timer = findTimer(name);


  if (timer) {
    destroyTimer(timer.timer_id);
  }
};

exports.timerStart = timerStart;
exports.timerStop = timerStop;
exports.timerCancel = timerCancel;


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

(function(){
  var crypt = __webpack_require__(31),
      utf8 = __webpack_require__(15).utf8,
      isBuffer = __webpack_require__(32),
      bin = __webpack_require__(15).bin,

  // The core
  md5 = function (message, options) {
    // Convert to byte array
    if (message.constructor == String)
      if (options && options.encoding === 'binary')
        message = bin.stringToBytes(message);
      else
        message = utf8.stringToBytes(message);
    else if (isBuffer(message))
      message = Array.prototype.slice.call(message, 0);
    else if (!Array.isArray(message))
      message = message.toString();
    // else, assume byte array already

    var m = crypt.bytesToWords(message),
        l = message.length * 8,
        a =  1732584193,
        b = -271733879,
        c = -1732584194,
        d =  271733878;

    // Swap endian
    for (var i = 0; i < m.length; i++) {
      m[i] = ((m[i] <<  8) | (m[i] >>> 24)) & 0x00FF00FF |
             ((m[i] << 24) | (m[i] >>>  8)) & 0xFF00FF00;
    }

    // Padding
    m[l >>> 5] |= 0x80 << (l % 32);
    m[(((l + 64) >>> 9) << 4) + 14] = l;

    // Method shortcuts
    var FF = md5._ff,
        GG = md5._gg,
        HH = md5._hh,
        II = md5._ii;

    for (var i = 0; i < m.length; i += 16) {

      var aa = a,
          bb = b,
          cc = c,
          dd = d;

      a = FF(a, b, c, d, m[i+ 0],  7, -680876936);
      d = FF(d, a, b, c, m[i+ 1], 12, -389564586);
      c = FF(c, d, a, b, m[i+ 2], 17,  606105819);
      b = FF(b, c, d, a, m[i+ 3], 22, -1044525330);
      a = FF(a, b, c, d, m[i+ 4],  7, -176418897);
      d = FF(d, a, b, c, m[i+ 5], 12,  1200080426);
      c = FF(c, d, a, b, m[i+ 6], 17, -1473231341);
      b = FF(b, c, d, a, m[i+ 7], 22, -45705983);
      a = FF(a, b, c, d, m[i+ 8],  7,  1770035416);
      d = FF(d, a, b, c, m[i+ 9], 12, -1958414417);
      c = FF(c, d, a, b, m[i+10], 17, -42063);
      b = FF(b, c, d, a, m[i+11], 22, -1990404162);
      a = FF(a, b, c, d, m[i+12],  7,  1804603682);
      d = FF(d, a, b, c, m[i+13], 12, -40341101);
      c = FF(c, d, a, b, m[i+14], 17, -1502002290);
      b = FF(b, c, d, a, m[i+15], 22,  1236535329);

      a = GG(a, b, c, d, m[i+ 1],  5, -165796510);
      d = GG(d, a, b, c, m[i+ 6],  9, -1069501632);
      c = GG(c, d, a, b, m[i+11], 14,  643717713);
      b = GG(b, c, d, a, m[i+ 0], 20, -373897302);
      a = GG(a, b, c, d, m[i+ 5],  5, -701558691);
      d = GG(d, a, b, c, m[i+10],  9,  38016083);
      c = GG(c, d, a, b, m[i+15], 14, -660478335);
      b = GG(b, c, d, a, m[i+ 4], 20, -405537848);
      a = GG(a, b, c, d, m[i+ 9],  5,  568446438);
      d = GG(d, a, b, c, m[i+14],  9, -1019803690);
      c = GG(c, d, a, b, m[i+ 3], 14, -187363961);
      b = GG(b, c, d, a, m[i+ 8], 20,  1163531501);
      a = GG(a, b, c, d, m[i+13],  5, -1444681467);
      d = GG(d, a, b, c, m[i+ 2],  9, -51403784);
      c = GG(c, d, a, b, m[i+ 7], 14,  1735328473);
      b = GG(b, c, d, a, m[i+12], 20, -1926607734);

      a = HH(a, b, c, d, m[i+ 5],  4, -378558);
      d = HH(d, a, b, c, m[i+ 8], 11, -2022574463);
      c = HH(c, d, a, b, m[i+11], 16,  1839030562);
      b = HH(b, c, d, a, m[i+14], 23, -35309556);
      a = HH(a, b, c, d, m[i+ 1],  4, -1530992060);
      d = HH(d, a, b, c, m[i+ 4], 11,  1272893353);
      c = HH(c, d, a, b, m[i+ 7], 16, -155497632);
      b = HH(b, c, d, a, m[i+10], 23, -1094730640);
      a = HH(a, b, c, d, m[i+13],  4,  681279174);
      d = HH(d, a, b, c, m[i+ 0], 11, -358537222);
      c = HH(c, d, a, b, m[i+ 3], 16, -722521979);
      b = HH(b, c, d, a, m[i+ 6], 23,  76029189);
      a = HH(a, b, c, d, m[i+ 9],  4, -640364487);
      d = HH(d, a, b, c, m[i+12], 11, -421815835);
      c = HH(c, d, a, b, m[i+15], 16,  530742520);
      b = HH(b, c, d, a, m[i+ 2], 23, -995338651);

      a = II(a, b, c, d, m[i+ 0],  6, -198630844);
      d = II(d, a, b, c, m[i+ 7], 10,  1126891415);
      c = II(c, d, a, b, m[i+14], 15, -1416354905);
      b = II(b, c, d, a, m[i+ 5], 21, -57434055);
      a = II(a, b, c, d, m[i+12],  6,  1700485571);
      d = II(d, a, b, c, m[i+ 3], 10, -1894986606);
      c = II(c, d, a, b, m[i+10], 15, -1051523);
      b = II(b, c, d, a, m[i+ 1], 21, -2054922799);
      a = II(a, b, c, d, m[i+ 8],  6,  1873313359);
      d = II(d, a, b, c, m[i+15], 10, -30611744);
      c = II(c, d, a, b, m[i+ 6], 15, -1560198380);
      b = II(b, c, d, a, m[i+13], 21,  1309151649);
      a = II(a, b, c, d, m[i+ 4],  6, -145523070);
      d = II(d, a, b, c, m[i+11], 10, -1120210379);
      c = II(c, d, a, b, m[i+ 2], 15,  718787259);
      b = II(b, c, d, a, m[i+ 9], 21, -343485551);

      a = (a + aa) >>> 0;
      b = (b + bb) >>> 0;
      c = (c + cc) >>> 0;
      d = (d + dd) >>> 0;
    }

    return crypt.endian([a, b, c, d]);
  };

  // Auxiliary functions
  md5._ff  = function (a, b, c, d, x, s, t) {
    var n = a + (b & c | ~b & d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._gg  = function (a, b, c, d, x, s, t) {
    var n = a + (b & d | c & ~d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._hh  = function (a, b, c, d, x, s, t) {
    var n = a + (b ^ c ^ d) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };
  md5._ii  = function (a, b, c, d, x, s, t) {
    var n = a + (c ^ (b | ~d)) + (x >>> 0) + t;
    return ((n << s) | (n >>> (32 - s))) + b;
  };

  // Package private blocksize
  md5._blocksize = 16;
  md5._digestsize = 16;

  module.exports = function (message, options) {
    if (message === undefined || message === null)
      throw new Error('Illegal argument ' + message);

    var digestbytes = crypt.wordsToBytes(md5(message, options));
    return options && options.asBytes ? digestbytes :
        options && options.asString ? bin.bytesToString(digestbytes) :
        crypt.bytesToHex(digestbytes);
  };

})();


/***/ }),
/* 31 */
/***/ (function(module, exports) {

(function() {
  var base64map
      = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',

  crypt = {
    // Bit-wise rotation left
    rotl: function(n, b) {
      return (n << b) | (n >>> (32 - b));
    },

    // Bit-wise rotation right
    rotr: function(n, b) {
      return (n << (32 - b)) | (n >>> b);
    },

    // Swap big-endian to little-endian and vice versa
    endian: function(n) {
      // If number given, swap endian
      if (n.constructor == Number) {
        return crypt.rotl(n, 8) & 0x00FF00FF | crypt.rotl(n, 24) & 0xFF00FF00;
      }

      // Else, assume array and swap all items
      for (var i = 0; i < n.length; i++)
        n[i] = crypt.endian(n[i]);
      return n;
    },

    // Generate an array of any length of random bytes
    randomBytes: function(n) {
      for (var bytes = []; n > 0; n--)
        bytes.push(Math.floor(Math.random() * 256));
      return bytes;
    },

    // Convert a byte array to big-endian 32-bit words
    bytesToWords: function(bytes) {
      for (var words = [], i = 0, b = 0; i < bytes.length; i++, b += 8)
        words[b >>> 5] |= bytes[i] << (24 - b % 32);
      return words;
    },

    // Convert big-endian 32-bit words to a byte array
    wordsToBytes: function(words) {
      for (var bytes = [], b = 0; b < words.length * 32; b += 8)
        bytes.push((words[b >>> 5] >>> (24 - b % 32)) & 0xFF);
      return bytes;
    },

    // Convert a byte array to a hex string
    bytesToHex: function(bytes) {
      for (var hex = [], i = 0; i < bytes.length; i++) {
        hex.push((bytes[i] >>> 4).toString(16));
        hex.push((bytes[i] & 0xF).toString(16));
      }
      return hex.join('');
    },

    // Convert a hex string to a byte array
    hexToBytes: function(hex) {
      for (var bytes = [], c = 0; c < hex.length; c += 2)
        bytes.push(parseInt(hex.substr(c, 2), 16));
      return bytes;
    },

    // Convert a byte array to a base-64 string
    bytesToBase64: function(bytes) {
      for (var base64 = [], i = 0; i < bytes.length; i += 3) {
        var triplet = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
        for (var j = 0; j < 4; j++)
          if (i * 8 + j * 6 <= bytes.length * 8)
            base64.push(base64map.charAt((triplet >>> 6 * (3 - j)) & 0x3F));
          else
            base64.push('=');
      }
      return base64.join('');
    },

    // Convert a base-64 string to a byte array
    base64ToBytes: function(base64) {
      // Remove non-base-64 characters
      base64 = base64.replace(/[^A-Z0-9+\/]/ig, '');

      for (var bytes = [], i = 0, imod4 = 0; i < base64.length;
          imod4 = ++i % 4) {
        if (imod4 == 0) continue;
        bytes.push(((base64map.indexOf(base64.charAt(i - 1))
            & (Math.pow(2, -2 * imod4 + 8) - 1)) << (imod4 * 2))
            | (base64map.indexOf(base64.charAt(i)) >>> (6 - imod4 * 2)));
      }
      return bytes;
    }
  };

  module.exports = crypt;
})();


/***/ }),
/* 32 */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var logHandler = __webpack_require__(34);
var networkHandler = __webpack_require__(35);
var viewHandler = __webpack_require__(36);
var displayHandler = __webpack_require__(37);
var errorHandler = __webpack_require__(38);
var config = __webpack_require__(1);


var handlers = {
  collectLogs: logHandler,
  collectNetworkCalls: networkHandler,
  collectPageLoads: viewHandler,
  collectDisplayInfo: displayHandler,
  collectUnhandledErrors: errorHandler
};

function init() {
  var handlerKey, handlerFunc;
  for (handlerKey in handlers) {
    handlerFunc = handlers[handlerKey];

    if (config.getOption(handlerKey)) {
      handlerFunc.attach();
    } else {
      handlerFunc.detach();
    }

  }
}


function reset() {

  var handlerKey, handlerFunc;
  for (handlerKey in handlers) {
    handlerFunc = handlers[handlerKey];
    handlerFunc.detach(true);
  }
}

exports.init = init;
exports.reset = reset;


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/*eslint-disable no-console */

var logConsole = __webpack_require__(16);
var config = __webpack_require__(1);

var handlerInjected = false;
var handlerEnabled = false;
var originalFunctions = {};

var attach = function() {

  handlerEnabled = true;
  if (handlerInjected) {
    return;
  }

  console.log = customLogger('log');
  console.warn = customLogger('warn');
  console.info = customLogger('info');
  console.error = customLogger('error');
  handlerInjected = true;
};

var detach = function(hard) {
  handlerEnabled = false;
  if(hard) {
    handlerInjected = false;
    for (var funcKey in originalFunctions) {
      var origFunc = originalFunctions[funcKey];
      if(typeof origFunc === 'function') {
        console[funcKey] = origFunc;
      }
    }
  }
};

var customLogger = function(logType) {

  var originalFunction = console[logType];
  originalFunctions[logType] = originalFunction;

  return function() {
    if(handlerEnabled) {
      // send log event
      logConsole(arguments[0], logType);
      if (!config.getOption('silent')) {
        return originalFunction.apply(console, arguments);
      }
    } else {
      return originalFunction.apply(console, arguments);
    }
  };
};

exports.attach = attach;
exports.detach = detach;

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

/*eslint-disable no-extra-boolean-cast */

var factory = __webpack_require__(0);
var timestamp = __webpack_require__(2);
var url_blacklist = __webpack_require__(13);
var config = __webpack_require__(1);


var XHR = XMLHttpRequest;

var originalOpen;
var originalSend;

var _Open = XHR.prototype.open;
var _Send = XHR.prototype.send;

var handlerInjected = false;
var handlerEnabled = false;

var attach = function() {
  handlerEnabled = true;

  if (handlerInjected) {
    return;
  }

  // Save Original Prototypes
  originalOpen = XHR.prototype.open;
  originalSend = XHR.prototype.send;

  XHR.prototype.open = customOpen;
  XHR.prototype.send = customSend;

  handlerInjected = true;
};

//#todo After Mint network Attach if some lib x replaces open/send proto.. replacing here with original will wipe out lib x's send/open
// silently disabling Mint code should prevent this behavior.
var detach = function(hard) {
  handlerEnabled = false;
  if (hard) {
    handlerInjected = false;
    if(typeof _Open === 'function')
      XHR.prototype.open = _Open;
    if(typeof _Send === 'function')
      XHR.prototype.send = _Send;
  }
};

function proxyOnReadyStateChange(xhr) {
  var oldOnReadyStateChange = xhr.onreadystatechange;

    xhr.onreadystatechange = function() {
      if ( typeof oldOnReadyStateChange === 'function' ) {
        oldOnReadyStateChange();
      }
      customReadyStateChange(xhr);
    };
}

function customOpen(method, url) {

  if(handlerEnabled) {
    this._p_method = method;
    this._p_url = url;
  }

  return originalOpen.apply(this, arguments);
}

function customSend(data) {

  if(handlerEnabled) {
    this._p_startTime = timestamp();
    this._p_requestDataLength = (data && data.length) ? data.length: 'N/A';

    // wire response callback
    if( !this.addEventListener ) {
      this.addEventListener('readystatechange', function() {
        customReadyStateChange(this);
      });
    }
    else {
      proxyOnReadyStateChange(this);
    }
  }

  return originalSend.apply(this, arguments);
}

function customReadyStateChange(xhr) {

  var method = xhr._p_method;
  var url = xhr._p_url || '';
  var protocol = url.indexOf('://') > -1 ? url.split('://').shift() : window.location.protocol.replace(':', '');

  var baseURL = config.getOption('baseURL');
  var hecURL = config.getOption('hecURL');
  var requestDataLength = xhr._p_requestDataLength;
  var startTime = xhr._p_startTime;

  //if url is pointing to CDS
  if (url.indexOf(baseURL) > -1 || url.indexOf(hecURL) > -1) {
    return false;
  }
  //if url is blacklisted

  var _url = url;
  if(method.toUpperCase() === 'GET' || method.toUpperCase() === 'HEAD') {
    _url = _url.split('?')[0];
  }
  if (url_blacklist.isURLBlackListed(_url) || url_blacklist.isURLPatternBlackListed(_url)) {
    return false;
  }

  if (xhr.readyState == 4) {
    var endTime = timestamp();
    var latency = endTime - startTime;
    var statusCode = xhr.status;

    var networkCall = {
      method: method,
      protocol: protocol,
      url: url,
      latency: latency,
      responseLength: xhr.responseText.length,
      requestLength: requestDataLength
    };

    if (statusCode < 400 && statusCode >= 100) {
      networkCall['failed'] = false;
      networkCall['statusCode'] = statusCode;
      networkCall['exception'] = 'NA';
    } else {
      networkCall['failed'] = true;
      networkCall['statusCode'] = statusCode;
      networkCall['exception'] = xhr.statusText;
    }

    factory('network', networkCall);
  }

}

exports.attach = attach;
exports.detach = detach;

/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

var factory = __webpack_require__(0);

//handler for views DTO
var handlerAdded = false;
var attach = function() {

  if(handlerAdded) {
    return;
  }

  if(document.readyState === 'complete') {
    customHandler();
  } else {
    window.addEventListener('load', customHandler);
  }
  handlerAdded = true;
};

var customHandler = function() {
  //settimeout to 0 pauses JS execution to let rendering threads catch up
  setTimeout(function() {
    // Performance metrics
    var t = window.performance.timing;
    var dataObj = {
      loadTime: t.loadEventEnd - t.navigationStart,
      domainLookupTime: t.domainLookupEnd - t.domainLookupStart,
      domProcessingTime: t.domComplete - t.domLoading,
      serverTime: t.responseEnd - t.responseStart,
      elapsedTime: t.loadEventEnd - t.unloadEventStart
    };
    factory('view', dataObj);
  }, 0);
};

var detach = function () {
  window.removeEventListener('load', customHandler);
  handlerAdded = false;
}

exports.attach = attach;
exports.detach = detach;

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

var factory = __webpack_require__(0);
var handlerAdded = false;

var attach = function() {
  if (handlerAdded) {
    return;
  }

  logDisplayEvent();
  // log display event on resize
  window.addEventListener('resize', logDisplayEvent);

  handlerAdded = true;
};

function logDisplayEvent() {
  factory('display', {
    screenHeight: window.screen['height'],
    screenWidth: window.screen['width'],
    colorDepth: window.screen['colorDepth'],
    pixelDepth: window.screen['pixelDepth'],
    windowHeight: (window.innerHeight !== undefined) ? window.innerHeight : document.documentElement.offsetHeight,
    windowWidth: (window.innerWidth !== undefined) ? window.innerWidth : document.documentElement.offsetWidth,
    screenOrientation: window.screen.orientation
  });
}

var detach = function() {
  window.removeEventListener('resize', logDisplayEvent);
  handlerAdded = false;
};

exports.attach = attach;
exports.detach = detach;

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/*eslint-disable no-console */
/* global WEBPACK_DEFINE_PRODUCTION */

var errors = __webpack_require__(14);


var handlerAdded = false;
var oldErrorHandler;

var customHandler = function() {
  if(handlerAdded) {
    var errorObj = arguments[4] || {};
    errors.logException(errorObj, null, false);
  }

  // only call in production. as onerror added by jasmine produces error which can not be caught by try/catch.. making error test cases to fail
  if(true) {
    if (typeof oldErrorHandler === 'function') {
      oldErrorHandler.apply(window, arguments);
    }
  }
};


var attach = function() {
  if (handlerAdded) {
    return;
  }
  oldErrorHandler = window.onerror;
  window.onerror = customHandler;

  handlerAdded = true;
};

var detach = function() {
  handlerAdded = false;
};

exports.attach = attach;
exports.detach = detach;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

var factory = __webpack_require__(0);

//log generic events 
//public method called by the user
//Extra data can be passed with this method

// logLevel: info | warn | error | log
var logEvent = function (eventName, logLevel, extraData) {
  var fields = {
    event_name: eventName
  };

  if (logLevel) {
    fields['level'] = logLevel;
  }

  if(extraData !== null && typeof(extraData) === 'object') {
    fields['extraData'] = extraData;
  }

  return factory('event', fields);
};

module.exports = logEvent;


/***/ })
/******/ ]);
});
//# sourceMappingURL=mint.js.map