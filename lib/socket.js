const io = require('socket.io-client');

const { Debug } = require('./utils');

module.exports = class Socket
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
    this.modules = modules;
    this.socket = null;
  }

  connect(url) {
    this.socket = io(url, this.options.socket);
    this.modules.socketEvents.refreshSocket(this.socket);
  }

  _connectionIsEtablished(callback) {
    if (this.modules.socketEvents.getStatusSocket()) return callback();
    this.modules.socketEvents.waitingSocket(() => callback());
  }

  _configureTimeout(uuid)
  {
    setTimeout(() => {
      if (this.modules.request.retrieve(uuid)) {
        this.modules.request.response(uuid, {
          response: {
            error: 'gateway_timeout',
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
