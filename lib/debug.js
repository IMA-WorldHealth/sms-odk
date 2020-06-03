const debug = require('debug')('imaworldhealth:sms-odk');

// eslint-disable-next-line
debug.log = console.log.bind(console);

module.exports = debug;
