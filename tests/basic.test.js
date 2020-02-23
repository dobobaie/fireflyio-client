const FireflyioClient = require('..//lib');

const fireflyioClient = new FireflyioClient('http://localhost:4000/', {
  debug: true,
  timeout: 5000
});

fireflyioClient.socket.on('HELLO_CLIENT', response => {
  console.log('HELLO_CLIENT', response);
});

fireflyioClient.get('/hello').then(response => {
  console.log('get', response);
});

fireflyioClient.post('/login', {
  username: 'myUsername',
  password: 'myPassword'
}).then(response => {
  console.log('post', response);
});
