require('dotenv').config();

const debug = require('./lib/debug');
const request = require('./lib/request');
const save = require('./lib/save');
const parser = require('./lib/parser');

const {
  SERVER_URL,
} = process.env;

// log the exit of the code
process.on('exit', (code) => {
  debug(`process exiting with code ${code}.`);
});

(async () => {
  // get the file path
  const [filePath] = process.argv.slice(2);

  try {
    debug(`called sms-odk with ${filePath}.`);

    const data = parser.parseSMSFile(filePath);

    debug('finished parsing SMS file.');

    // save sms locally
    save.insert(data.hash, data);

    debug('saved SMS. Submitting to server...');

    await request(SERVER_URL, data);

    debug('sms submitted to server.  Recording posted in database.');
    save.update(data.hash);

    debug('done.');
  } catch (error) {
    debug('error: an error occured in the process.');
    debug('error: %O', error);
    debug(`error: sms file was: ${filePath}`);
  }
})();
