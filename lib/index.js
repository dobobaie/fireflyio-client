const EventEmitter = require('events');

const RequestManager = require('./request');
const SocketManager = require('./socket');
const SocketEventsManager = require('./socketEvents');
const { Debug } = require('./utils');

const defaultOptions = {
  debug: false,
  timeout: 15000,
  socket: {
    reconnection: true,
    reconnectionDelay: 500,
    reconnectionAttempts: 10
  }
};

module.exports = class $fireflyioClient
{
  constructor(url, custom_options) {
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.options.timeout = parseInt(this.options.timeout);
    this.debug = Debug(this.options).debug;

    this.modules = {};
    this.modules.event = new EventEmitter();
    this.modules.request = new RequestManager(this, this.options, this.modules);
    this.modules.socket = new SocketManager(this, this.options, this.modules);
    this.modules.socketEvents = new SocketEventsManager(this, this.options, this.modules);

    this.modules.socket.connect(url, this.options.socket);

    // to move
    this.socket = {
      on: (...args) => this.modules.event.on(...args),
    };
  }

  authenticate(access_token) {
    return this.modules.request.push('AUTHENTICATE', undefined, undefined, {
      Authorization: `Bearer ${access_token}`
    });
  }

  get(route, custom_headers) {
    return this.modules.request.push('GET', route, undefined, custom_headers);
  };

  delete(route, custom_headers) {
    return this.modules.request.push('DELETE', route, undefined, custom_headers);
  };

  post(route, body, custom_headers) {
    return this.modules.request.push('POST', route, body, custom_headers);
  };

  put(route, body, custom_headers) {
    return this.modules.request.push('PUT', route, body, custom_headers);
  };
};
