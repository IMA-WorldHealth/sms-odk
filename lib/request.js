const fetch = require('node-fetch');
const debug = require('./debug').extend('request');

async function send(url, data) {
  debug(`posting data to ${url}`);
  const body = JSON.stringify(data);

  debug('data to post: %O', data);
  const headers = { 'Content-Type': 'application/json' };

  const response = await fetch(url, { method: 'POST', body, headers });
  debug(`received res.status: ${response.status}`);
  return response.json();
}

module.exports = send;
