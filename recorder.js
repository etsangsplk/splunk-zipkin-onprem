/* eslint-env browser */
const {	BatchRecorder } = require('zipkin');
const { HttpLogger }    = require('zipkin-transport-http');

// ------------------------------------------------------------------------
//    Zipkin data recorder for Splunk
// ------------------------------------------------------------------------
// Where to send the data
var splunk_host_port = 'http://localhost:8088';
var splunk_hec_token = '00000000-0000-0000-0000-000000000000';

// Build the Splunk URL including Basic Authorization  (http://x:<token>@<host>:<port>/services/collector/raw)
var splunk_URL = splunk_host_port + '/services/collector/raw';

//console.log("Sending traces to: " + splunk_URL );
const recorder = new BatchRecorder({
  logger: new HttpLogger({
      endpoint: splunk_URL,
      headers: {'Authorization': 'Splunk ' + splunk_hec_token },
   })
});

module.exports.recorder = recorder;
