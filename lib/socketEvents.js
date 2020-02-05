const { Debug } = require('./utils');

module.exports = class SocketEvents
{
  constructor(fireflyio, options, modules) {
    this.options = options;
    this.debug = Debug(this.options).debug;
    this.fireflyio = fireflyio;
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

      if (request && request.pleaseRedirect) {
        this.debug('[DEBUG]', `FIREFLYIO-CLIENT: redirection required to`, request.pleaseRedirect);
        this.modules.socket.connect(request.pleaseRedirect);
        return ;
      }

      if (request && request.error) {
        this.debug('[DEBUG]', `FIREFLYIO-CLIENT: hello error`, request.reason);
        this.socket.close();
        return ;
      }
    
      this.statusSocket = true;
      this.processWaitingSocketQueue();
    });
    
    this.socket.on('GET', request =>
      this.modules.request.response(request.uuid, request)
    );
    
    this.socket.on('events', response =>
      this.modules.event.emit(response.event, response.data)
    );

    this.socket.on('disconnect', () => {
      this.debug('[DEBUG]', `FIREFLYIO-CLIENT: is diconnected`);
      this.statusSocket = false;
    });

    this.socket.on('connect_error', reason => {
      this.debug('[DEBUG]', `FIREFLYIO-CLIENT: connect error`, reason);
    });
  }

  getStatusSocket() {
    return this.statusSocket;
  }
};
