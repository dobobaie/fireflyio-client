const io = require('socket.io-client');

const { Debug } = require('./utils');

module.exports = class Socket
{
  constructor(options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.modules = modules;
    this.socket = null;
    this.requestsQueue = {};
  }

  connect(url) {
    this.socket = io(url);
    this.modules.event.refreshSocket(this.socket);
  }

  _connectionIsEtablished(callback) {
    if (this.modules.event.getStatusSocket()) return callback();
    this.modules.event.waitingSocket(() => callback());
  }

  _configureTimeout(uuid)
  {
    setTimeout(() => {
      if (this.modules.request.retrieve(uuid)) {
        this.modules.request.response(uuid, {
          response: {
            error: 'Gateway Timeout',
            status: 504
          }
        });
      }
    }, this.options.timeout);
  }

  send(uuid, method, query)
  {
    this._connectionIsEtablished(() => {
      if (this.modules.request.retrieve(uuid)) {
        this.socket.emit(method, query);
      }
    })
    if (this.options.timeout !== -1) {
      this._configureTimeout(uuid);
    }
  }
};
