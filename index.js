
const fs = require('fs');

try {
  const xlsx = require('xlsx');
  const path = require('path');
  const Request = require('./request.js');

  // save sms locally
  const save = require('./save');

  // get the file path
  const filePath = process.argv.slice(2)[0];

  // reading the log file
  const t = fs.readFileSync(filePath, { encoding: 'utf-8' });

  // sms separator
  const sep = '~';
  const sms = t.split('\n');

  // get column names from the xlsx survey
  const workbook = xlsx.readFile(path.resolve(__dirname, './survey.xlsx'));
  const xlData = xlsx.utils.sheet_to_json(workbook.Sheets.survey);

  const columnMap = {};
  xlData.forEach((c) => {
    columnMap[c.compact_tag] = c.name;
  });

  // remove a portion of a text
  function rm(str, txt) {
    return str.replace(txt, '');
  }

  // formating servey collected data
  function formatSMS(str) {
    const fist = str.indexOf(sep) + 1;

    const obj = {
      form_name: str.substr(0, fist - 1),
    };

    str = str.substr(fist, str.length);

    const _array = str.split(sep);

    for (let i = 0; i < _array.length; i += 2) {
      // use compact_tag if the name is not found in the xlsx survey
      const newKey = columnMap[_array[i]] || _array[i];

      const value = _array[i + 1] || '';
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
    data: formatSMS(sms[14]),
  };

  // save sms locally
  save.saveSMS(data);

  req = new Request('https://odk2bhima.pepkits.org/depot_movement');
  req.postData(data);
} catch (xs) {
  fs.writeFileSync(path.resolve(__dirname, './test.json'), JSON.stringfy(xs));
}
