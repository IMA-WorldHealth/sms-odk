require('dotenv').config();

const fs = require('fs');
const xlsx = require('xlsx');
const path = require('path');
const util = require('util');
const debug = require('./lib/debug');
const Request = require('./lib/request.js');
const save = require('./lib/save');

const logger = fs.createWriteStream(process.env.LOGFILE, { flags: 'a', encoding: 'utf8' });

const { SERVER_URL } = process.env;

// make the debug logger log out to
debug.log = (...args) => {
  logger.write(`${util.format(...args).trim()}\n`);
};

// make sure we close out the stream with a writeable stream.
process.on('exit', (code) => {
  logger.end(`process exiting with code ${code}.`);
});


// remove a portion of a text
function rm(str, txt) {
  return str.replace(txt, '');
}

// formating servey collected data
function formatSMS(str, sep, columnMap) {
  const first = str.indexOf(sep) + 1;

  const obj = {
    form_name: str.substr(0, first - 1),
  };

  const strng = str.substr(first, str.length);

  const array = strng.split(sep);

  for (let i = 0; i < array.length; i += 2) {
    // use compact_tag if the name is not found in the xlsx survey
    const newKey = columnMap[array[i]] || array[i];

    const value = array[i + 1] || '';
    if (newKey) {
      if (!obj[newKey]) {
        obj[newKey] = value;
      } else {
        // handle repete question keys
        const isArray = Array.isArray(obj[newKey]);
        if (isArray) {
          obj[newKey].push(value);
        } else {
          obj[newKey] = [obj[newKey], value];
        }
      }
    }
  }
  return obj;
}

try {
  // get the file path
  const [filePath] = process.argv.slice(2);

  debug(`called sms-odk with ${filePath}.`);

  // reading the log file
  const t = fs.readFileSync(filePath, { encoding: 'utf-8' });

  debug(`file read into memory.  Length is ${t.length} characters`);

  // sms separator
  const sep = '~';
  const sms = t.split('\n');

  debug(`separator is "${sep}".`);
  debug(`split sms into ${sms.length} parts.`);

  const xlsxPath = path.resolve(__dirname, 'survey.xlsx');
  debug(`reading survey from ${xlsxPath}`);

  // get column names from the xlsx survey
  const workbook = xlsx.readFile(xlsxPath);
  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets.survey);

  const columnMap = {};
  xlData
    .forEach((c) => {
      columnMap[c.compact_tag] = c.name;
    });

  const keys = Object.keys(columnMap);

  debug(`Created column map with keys: ${keys.join(',')}.`);

  // SMS txt into json
  const data = {
    From: rm(sms[1], 'From: '),
    From_TOA: rm(sms[2], 'From_TOA: '),
    From_SMSC: rm(sms[3], 'From_SMSC: '),
    Sent: rm(sms[4], 'Sent: '),
    Received: rm(sms[5], 'Received: '),
    Subject: rm(sms[6], 'Subject: '),
    Modem: rm(sms[7], 'Modem: '),
    IMSI: rm(sms[8], 'IMSI: '),
    IMEI: rm(sms[9], 'IMEI: '),
    Report: rm(sms[10], 'Report: '),
    Alphabet: rm(sms[11], 'Alphabet: '),
    Length: rm(sms[12], 'Length: '),
    data: formatSMS(sms[14], sep, columnMap),
  };

  debug(`parsed the data as follows:${JSON.stringify(data)}`);

  // save sms locally
  save.saveSMS(data);

  debug('saved SMS. Submitting to server...');

  const req = new Request(SERVER_URL);

  req.postData(data);
} catch (xs) {
  fs.writeFileSync(path.resolve(__dirname, './test.json'), JSON.stringify(xs));
}
