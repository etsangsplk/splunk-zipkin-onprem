/* eslint-disable import/newline-after-import */
// initialize tracer
const rest = require('rest');
const express = require('express');
const CLSContext = require('zipkin-context-cls');
const {Tracer} = require('zipkin');
const {recorder} = require('./recorder');

const ctxImpl = new CLSContext('zipkin');
const tracer = new Tracer({ctxImpl, recorder});

const app = express();

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
app.use(zipkinMiddleware({
  tracer,
  serviceName: 'backend' // name of this application
}));

// instrument the client
const {restInterceptor} = require('zipkin-instrumentation-cujojs-rest');
const zipkinRest = rest.wrap(restInterceptor, {tracer, serviceName: 'backend'});

// Allow cross-origin, traced requests. See http://enable-cors.org/server_expressjs.html
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', [
    'Origin', 'Accept', 'X-Requested-With', 'X-B3-TraceId',
    'X-B3-ParentSpanId', 'X-B3-SpanId', 'X-B3-Sampled'
  ].join(', '));
  next();
});

//app.get('/api', (req, res) => res.send(new Date().toString()));
app.get('/backend', (req, res) => {
  zipkinRest('http://localhost:9002/magical?ts=' + encodeURIComponent(new Date().getMinutes().toString()) )
    .then(response => res.send(response.entity))
  .catch(err => console.error('Error', err.stack));
});



app.listen(9000, () => {
  console.log('Backend listening on port 9000!');
});
