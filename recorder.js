/* eslint-env browser */
const {	BatchRecorder } = require('zipkin');
const { HttpLogger }    = require('zipkin-transport-http');

// ------------------------------------------------------------------------
//    Zipkin data recorder for Splunk
// ------------------------------------------------------------------------
// Where to send the data
var splunk_protocol  = 'http';
var splunk_host_port = 'localhost:8088';
var splunk_hec_token = 'ef640831-775f-466d-afa3-405ea403e12c';

// Build the Splunk URL including Basic Authorization  (http://x:<token>@<host>:<port>/services/collector/raw)
var splunk_URL = splunk_protocol + '://x:' + splunk_hec_token + '@' + splunk_host_port + '/services/collector/raw';

//console.log("Sending traces to: " + splunk_URL );
const recorder = new BatchRecorder({
  logger: new HttpLogger({
      endpoint: splunk_URL
   })
});

module.exports.recorder = recorder;


//var splunk_protocol  = 'https';
//var splunk_host_port = 'mattymo.io:8088';
//var splunk_hec_token = 'a53d0717-4d44-4c3e-9501-e2c660cd4604';

