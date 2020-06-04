const fs = require('fs');
const { v4 } = require('uuid');
const xlsx = require('xlsx');
const hash = require('object-hash');
const path = require('path');
const debug = require('./debug').extend('parser');

const {
  SURVEY_FILE,
  SEPARATOR,
} = process.env;

function generateUuid() {
  return `uuid:${v4()}`;
}

// remove a portion of a text
function rm(str = '', txt) {
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


/**
 * @function getColumnMap
 *
 * @description
 * Reads from the XLSX file to create a column mapping of compact_tag names
 * to regular key names.
 */
function getColumnMap() {
  debug(`survey file path is: ${SURVEY_FILE}.`);
  const xlsxPath = path.resolve(__dirname, SURVEY_FILE);
  debug(`reading survey from ${xlsxPath}.`);

  // get column names from the xlsx survey
  const workbook = xlsx.readFile(xlsxPath);
  const xl = xlsx.utils.sheet_to_json(workbook.Sheets.survey);

  return xl
    .reduce((columnMap, row) => {
      columnMap[row.compact_tag] = row.name; // eslint-disable-line
      return columnMap;
    }, {});
}

/**
 * @function parseSMSFile
 *
 * @description
 * Takes in a file path, reads it into memory, and parses the SMS into a JSON object
 * for submission to the server.
 */
function parseSMSFile(fpath) {
  debug(`reading sms from ${fpath}.`);

  const contents = fs.readFileSync(fpath, 'utf8');

  debug(`file read into memory.  Length is ${contents.length} characters`);

  const sep = SEPARATOR || '+';
  const sms = contents
    .replace('-----', '')
    .split('\n');

  debug(`separator is "${sep}".`);
  debug(`split sms into ${sms.length} parts.`);

  const columnMap = getColumnMap();

  const keys = Object.keys(columnMap);

  debug(`Created column map with keys: ${keys.join(',')}.`);

  // SMS txt into json
  const data = {
    uuid: generateUuid(),
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

  debug('parsed the data as follows: %O', data);

  // hash the data so we know if this is a duplicate submission.
  data.hash = hash(data);

  debug(`data is hashed as: ${data.hash}`);

  return data;
}

exports.parseSMSFile = parseSMSFile;
