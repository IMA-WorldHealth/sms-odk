const request = require('request-promise-native');
const q = require('q');

class Request {

  constructor(url) {
    this.url = url;
  }

  postData(params) {
    const deferred = q.defer();
    request({
      url: params.url || this.url,
      method: 'POST',
      body : params.data,
      headers: {
        'Content-Type': 'application/json',
      }
    }, function (error, response, body) {
      if (!error) {
        return deferred.resolve(body);
      }
      return deferred.reject(error);
    });

    return deferred.promise;
  }


  getData(params) {
    const deferred = q.defer();
    request({
      url: params.url || this.url,
      method: 'GET',
      body: params.data,
      headers: {
        'Content-Type': 'application/json'
      }
    }, function (error, response, body) {
      if (!error) {
        return deferred.resolve(body);
      }
      return deferred.reject(error);
    });

    return deferred.promise;
  }
}

module.exports = Request;
