const path = require('path');
const childProc = require('child_process');

childProc.fork(path.join(__dirname, 'frontend.js'));
childProc.fork(path.join(__dirname, 'backend.js'));
childProc.fork(path.join(__dirname, 'thirdparty.js'));
childProc.fork(path.join(__dirname, 'magical.js'));
