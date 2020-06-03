const debug = require('debug')('imaworldhealth:sms-odk');
const util = require('util');
const db = require('./db');

const insert = db.prepare('INSERT INTO logs (message) VALUES (?);');

debug.log = (...args) => {
  const message = util.inspect(...args);
  insert.run(message);

  // eslint-disable-next-line
  console.log(message);
};

module.exports = debug;
