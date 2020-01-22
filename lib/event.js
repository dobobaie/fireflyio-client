const { Debug } = require('./utils');

module.exports = class Event
{
  constructor(options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.modules = modules;
    this.waitingSocketQueue = [];
    this.socket = null;
    this.statusSocket = false;
  }

  processWaitingSocketQueue()
  {
    this.waitingSocketQueue.map(callback => callback());
    this.waitingSocketQueue = [];
  }

  waitingSocket(callback)
  {
    this.waitingSocketQueue.push(() => callback());
  }

  refreshSocket(socket) {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = socket;
    this.statusSocket = false;

    this.socket.on('connect', () =>
      this.debug('[DEBUG]', `FIREFLYIO-CLIENT: is connected`)
    );

    this.socket.on('reconnect', () =>
      this.debug('[DEBUG]', `FIREFLYIO-CLIENT: is connected`)
    );
    
    this.socket.on('hello', request => {

      this.debug('[DEBUG]', `FIREFLYIO-CLIENT: hello`, request);
    
      this.statusSocket = true;
      this.processWaitingSocketQueue();
    });
    
    this.socket.on('GET', request =>
      this.modules.request.response(request.uuid, request)
    );
    
    this.socket.on('disconnect', () => {
      this.debug('[DEBUG]', `FIREFLYIO-CLIENT: is diconnected`);
      this.statusSocket = false;
    });
  }

  getStatusSocket() {
    return this.statusSocket;
  }
};
