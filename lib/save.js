const db = require('./db');
const debug = require('./debug').extend('save');

const iquery = db.prepare('INSERT INTO sms (hash, data) VALUES (?, ?);');

function insert(hash, data) {
  debug('writing sms to database for safe-keeping');
  iquery.run(hash, JSON.stringify(data));
  debug('done.');
}

const uquery = db.prepare('UPDATE sms SET sent = TRUE WHERE hash = ?');
function update(hash) {
  debug('setting posted to true');
  uquery.run(hash);
  debug('done.');
}

module.exports = {
  insert, update,
};
