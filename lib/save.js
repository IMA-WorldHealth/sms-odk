const fs = require('fs');
const path = require('path');
const moment = require('moment');
const debug = require('./debug').extend('save');

function saveSMS(jsonSMS) {
  const today = moment(new Date()).format('Y-MM-d');
  const hour = moment(new Date()).format('H-m-s');

  const directory = path.resolve(__dirname, `./sms/${today}`);

  const file = `${(jsonSMS.From || '')}-${hour}-${(Math.floor(Math.random() * 100))}`;

  try {
    fs.mkdirSync(directory, { recursive: true });
  } catch (error) {
    debug('An error occurred creating directory: ', error);
  }

  fs.writeFileSync(path.resolve(directory, `${file}.json`), JSON.stringify(jsonSMS));
}

module.exports.saveSMS = saveSMS;
