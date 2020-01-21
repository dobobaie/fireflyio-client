const io = require('socket.io-client');
const uuidv4 = require('uuid/v4');

const defaultOptions = {
  debug: false,
  timeout: 5000
};

const defaultHeaders = {
  'Content-Type': 'application/json'
};

module.exports = class $fireflyio
{
  constructor(url, custom_options) {
    this.url = url;
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.requestsQueue = {};
    this.waitingSocketQueue = [];
    this.socket = null;
    this.statusSocket = false;
    this._ioEvents();
  }

  _ioEvents() {
    if (this.socket) {
      this.socket.close();
    }
    this.socket = io(this.url);
    this.socket.on('connect', () => {
      console.log('io client: connect');

      this.socket.on('GET', data =>
        this._processEvent(data.uuid, data)
      );

      this.statusSocket = true;
      this._processWaitingSocketQueue();
    });
    this.socket.on('disconnect', () => {
      console.log('io client: disconnect');
      this.statusSocket = false;
    });
  }

  _processEvent(uuid, data) {
    if (this.requestsQueue[uuid] && data.response.error === undefined) {
      this.requestsQueue[uuid].resolve(
        data.body,
        data.response
      );
      delete this.requestsQueue[uuid];
    }
    if (this.requestsQueue[uuid] && data.response.error !== undefined) {
      this.requestsQueue[uuid].reject(
        data.response.error,
        data.response
      );
      delete this.requestsQueue[uuid];
    }
  }

  _processWaitingSocketQueue() {
    this.waitingSocketQueue.map(callback => callback());
    this.waitingSocketQueue = [];
  }

  _connectionIsEtablished(callback) {
    if (this.statusSocket) return callback();
    this.waitingSocketQueue.push(() => callback());
  }

  _executeQuery(method, query) {
    return new Promise((resolve, reject) => {
      this.socket.emit(method, query);
      this.requestsQueue[query.uuid] = {
        resolve,
        reject,
        query
      };
      setTimeout(() => {
        if (this.requestsQueue[query.uuid]) {
          this._processEvent(query.uuid, {
            response: {
              error: 'Gateway Timeout',
              status: 504
            }
          });
        }
      }, this.options.timeout);
    });
  }

  _initializeQuery(method, route, body, custom_headers) {
    return new Promise((resolve, reject) =>
      this._connectionIsEtablished(() => {
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
        this._executeQuery(method, query)
          .then((...args) => resolve(...args))
          .catch((...args) => reject(...args));
      })
    );
  };

  get(route, custom_headers) {
    return this._initializeQuery('GET', route, undefined, custom_headers);
  };

  delete(route, custom_headers) {
    return this._initializeQuery('DELETE', route, undefined, custom_headers);
  };

  post(route, body, custom_headers) {
    return this._initializeQuery('POST', route, body, custom_headers);
  };

  put(route, body, custom_headers) {
    return this._initializeQuery('PUT', route, body, custom_headers);
  };
};
