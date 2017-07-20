/* eslint-env browser */
const {BatchRecorder} = require('zipkin');
const {HttpLogger} = require('zipkin-transport-http');

// ------------------------------------------------------------------------
//    Zipkin data recorder for Splunk Enterprise or SaaS (Firefawkes)
// ------------------------------------------------------------------------
var endpointURL, authToken;

// Are we sending to Splunk Enterprise or Firefawkes?
var sendToSplunkEnterprise = true;

// Where to send the data
var Splunk_endpointURL = 'http://splunk-enterprise:8088';
var	SaaS_endpointURL   = 'https://api.logface.io/v1/events';

//  Authentication Token   (Splunk Enterprise == HEC Token,   SaaS = userid:pwd)
//var Splunk_authToken = 'F5F60593-3F95-43B9-8799-4707C84360F4';  
var Splunk_authToken = '00000000-0000-0000-0000-000000000002';  
var SaaS_authToken   = '7JQGZLP1BLFPR71RFJ0LW0ZV0:kl+kZNRttZR6s0XiQvQq68MgmfFmMPbBM5eqOwzWAiM';


// Format the URL and Auth Token for the target platform:
if (sendToSplunkEnterprise){
	endpointURL = Splunk_endpointURL + '/services/collector/raw?channel=' + Splunk_authToken;
	authToken = 'Splunk ' + Splunk_authToken;
} else {
	endpointURL = SaaS_endpointURL;
	authToken = 'Basic ' + new Buffer(SaaS_authToken).toString('base64');
}

const recorder = new BatchRecorder({
  logger: new HttpLogger({
      endpoint: endpointURL,
      auth:     authToken
   })
});


module.exports.recorder = recorder;
