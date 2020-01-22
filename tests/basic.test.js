const FireflyioClient = require('../lib');

(async () => {
  // ---
  const fireflyioClient = new FireflyioClient('http://localhost:2525/', {
    debug: true,
    timeout: 5000
  });
  
  // fireflyioClient.delete('/users/toto/delete').then(response =>
  //   console.log('delete /users/toto/delete response', response)
  // ).catch(err => console.log('error delete /users/toto/delete', err));

  // fireflyioClient.get('/hello').then(response =>
  //   console.log('get /hello response', response)
  // ).catch(err => console.log('error get /hello', err));

  // fireflyioClient.post('/login', {
  //   username: 'Toto',
  //   password: 'Tutu'
  // }).then(response =>
  //   console.log('post /login response', response)
  // ).catch(err => console.log('error post /login', err));
  
  fireflyioClient.get('/tutu')
    .catch(err => console.log(`error`, `get('/tutu')`, err));
  // ---
})();
