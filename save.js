const fs = require('fs');
const path = require('path');
const moment = require('moment');
const debug = require('debug')('imaworldhealth:sms-odk:save');

function saveSMS(jsonSMS) {
  const today = moment(new Date()).format('Y-MM-d');
  const hour = moment(new Date()).format('H-m-s');

  const file = `${(jsonSMS.From || '')}-${hour}-${(Math.floor(Math.random() * 100))}`;

  try {
    fs.mkdirSync(path.resolve(__dirname, `./sms/${today}`), { recursive: true });
  } catch (error) {
    debug('An error occurred creating directory: ', error);
  }

  fs.writeFileSync(path.resolve(__dirname, `./sms/${today}/${file}.json`), JSON.stringify(jsonSMS));
}

module.exports.saveSMS = saveSMS;
