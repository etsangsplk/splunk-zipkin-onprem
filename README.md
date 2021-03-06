# Basic example showing distributed tracing from a web browser across node.js apps
This application was forked from the original source at:  https://github.com/openzipkin/zipkin-js-example 

This is an example app where a web browser and two express (node.js) services collaborate on an http request. Notably, timing of these requests are recorded into Splunk Enterprise. This allows you to see the how long the whole operation took, as well how much time was spent in each service.

Here's an example of what it looks like
<img width="972" alt="zipkin screen shot" src="./ZipkinOverview.png">

This example was initially shown at [DevOpsDays Singapore on Oct 8, 2016](https://speakerdeck.com/adriancole/introduction-to-distributed-tracing-and-zipkin-at-devopsdays-singapore). It was ported from similar examples, such as [Spring Boot](https://github.com/openzipkin/sleuth-webmvc-example).

# Implementation Overview

Web requests are served by [Express](http://expressjs.com/) controllers, and tracing is automatically performed for you by [zipkin-js](https://github.com/openzipkin/zipkin-js). JavaScript used in the web browser is bundled with [browserify](http://browserify.org/).

# Running the example
This example has four services: frontend, thirdparty, backend and magical. They all report trace data to zipkin. To setup the demo, you need to start the application (npm start) and Splunk Enterprise. You'll also need to bundle the JavaScript used by the web browser.

Once the services are started, and the JavaScript is bundled, `open index.html`
* This starts a trace in the browser and calls the frontend (http://localhost:8081/)
* This continues the trace and calls the backend (http://localhost:9000/backend) and thridparty (http://localhost:9001/3rdParty). The backend service will make a call to the magical service (http://localhost:9002/magical) passing in a date value.  The magical service returns a message that is then returned to the end user's browser. 

You will want to add the splunk_apps_for_zipkin to your Splunk instance in the /opt/splunk/etc/apps folder and restart Splunk.

Next, you can view traces that went through the backend via http://<splunk_server>/en-US/app/zipkin/zipkin_overview

## Setup

Before you start anything, you'll need to download the libraries used in this demo:
```bash
$ npm install
```
Edit the recorder.js file to point to your Splunk instance:
```
var splunk_protocol  = 'http';
var splunk_host_port = 'localhost:8088';
var splunk_hec_token = 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX';
```

Once that's done, bundle the JavaScript used by the browser:
```bash
$ npm run browserify
```

## Starting the Services
Run `npm start`.  This will start all 4 services:  
1. [frontend.js](./frontend.js) 
2. [backend.js](./backend.js)
3. [thirdparty.js](./thirdparty.js)
4. [magical.js](./magical.js)

```bash
$ npm start
```
## Execute the service
Open a web browser and hit http://localhost:8081/
