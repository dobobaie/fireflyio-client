const RequestManager = require('./request');
const SocketManager = require('./socket');
const EventManager = require('./event');
const { Debug } = require('./utils');

const defaultOptions = {
  debug: true,
  timeout: 5000
};

module.exports = class $fireflyio
{
  constructor(url, custom_options) {
    this.options = Object.assign({}, defaultOptions, custom_options);
    this.debug = Debug(this.options).debug;

    this.modules = {};
    this.modules.request = new RequestManager(this.options, this.modules);
    this.modules.socket = new SocketManager(this.options, this.modules);
    this.modules.event = new EventManager(this.options, this.modules);

    this.modules.socket.connect(url, this.options.socket);
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
