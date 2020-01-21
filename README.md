# [BETA] fireflyio-client
Expressive [fireflyio](https://github.com/dobobaie/fireflyio) framework for javacript to send resquest to `fireflyio` framework.  

## ☁️ Installation

```
$ unavaible
```

## 👋 Hello fireflyio  

``` js
const FireflyioClient = require('fireflyio-client');
const http = new FireflyioClient(ENV.FIREFLYIO_API_URL);

http.get('/hello')
  .then(res => console.log(res))
  .catch(err => console.error(err));
 
```

## 📝 Methods

### `get(route: string, headers: object)` method

```js
http.get('/hello')
  .then(res => console.log(res))
  .catch(err => console.error(err));
```

### `delete(route: string, headers: object)` method

```js
http.delete('/users/123456')
  .catch(err => console.error(err));
```

### `post(route: string, body: object, headers: object)` method

```js
http.post('/users', {
  username: 'Jean'
})
.then(res => console.log(res))
.catch(err => console.error(err));
```

### `put(route: string, body: object, headers: object)` method

```js
http.put('/users/123456', {
  username: 'JeanPierre'
}, {
  'Content-Type': 'application/json' // default
})
.then(res => console.log(res))
.catch(err => console.error(err));
```

## 👥 Contributing

Please help us to improve the project by contributing :)  

## ❓️ Testing

```
$ npm install
$ npm test
```
