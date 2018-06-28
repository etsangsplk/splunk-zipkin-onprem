/* eslint-disable import/newline-after-import */
// initialize tracer
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
  serviceName: '3rdParty' // name of this application
}));

app.get('/3rdParty', (req, res) => res.send(new Date().getMinutes().toString()));

app.listen(9001, () => {
  console.log('3rd Party listening on port 9001!');
});
