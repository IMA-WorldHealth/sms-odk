const fs = require('fs');
const path = require('path');

const Sqlite3 = require('better-sqlite3');

const db = new Sqlite3(path.resolve(__dirname, '../sms.db'));

db.pragma('journal_mode = WAL');

const schema = fs.readFileSync(path.resolve(__dirname, '../schema.sql'), 'utf8');

db.exec(schema.trim());

module.exports = db;
