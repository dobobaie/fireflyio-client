const uuidv4 = require('uuid/v4');

const { Debug } = require('./utils');

const defaultHeaders = {
  'Content-Type': 'application/json'
};

module.exports = class Request
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
    this.requestsQueue = {};
  }

  _buildQuery(method, route, body, custom_headers)
  {
    const query = {};
    query.uuid = uuidv4();
    query.date = new Date();
    query.location = route;
    query.headers = Object.assign({}, defaultHeaders, custom_headers, {
      method
    });
    if (['POST', 'PUT'].includes(method)) {
      query.body = body;
    }
    return query;
  }

  retrieve(uuid) {
    return this.requestsQueue[uuid];
  }

  response(uuid, data)
  {
    if (this.requestsQueue[uuid] && (data.response.code+'')[0] === '2') {
      this.requestsQueue[uuid].resolve(
        { data: data.body, response: data.response }
      );
      delete this.requestsQueue[uuid];
    }
    if (this.requestsQueue[uuid] && (data.response.code+'')[0] !== '2') {
      this.requestsQueue[uuid].reject(
        { response: data.response }
      );
      delete this.requestsQueue[uuid];
    }
  }

  push(method, route, body, custom_headers) {
    const query = this._buildQuery(method, route, body, custom_headers);
    return new Promise((resolve, reject) => {
      this.requestsQueue[query.uuid] = { resolve, reject, query };
      this.modules.socket.send(query.uuid, method, query);
    });
  };
};
