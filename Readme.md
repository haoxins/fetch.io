
[![NPM version][npm-img]][npm-url]
[![Build status][travis-img]][travis-url]
[![Test coverage][coveralls-img]][coveralls-url]
[![License][license-img]][license-url]
[![Dependency status][david-img]][david-url]

### fetch.io

Extends the whatwg `fetch` - [fetch spec](https://fetch.spec.whatwg.org) api,
makes it easier to use. Both node & browser supported.

* install

```bash
$ npm install fetch.io
```

* import

```js
// browser

const Fetch = require('fetch.io')

// node

const Fetch = require('fetch.io/lib/node')
```

### APIs

* .config() - set options
* .set() - set http header
* .type() - set content type
* .send() - send body data
* .query() - set query string
* .append() - append form data

* .text() - convert response body to `string`
* .json(strict = true) - convert response body to `object` (strict JSON mode default)

#### Options

* jsonHandler - `Function`, add a handler for `.json()`, to check the response data
* prefix - `String`, url prefix
* Other whatwg-fetch options

### Usage

```js
const request = new Fetch({
  prefix: 'http://example.com/api/v1'
})
```

* default options

```js
{
  prefix: '',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin'
}
```

```js
request
  .get(path)
  .config({
    credentials: 'omit'
  })
  .query({
    type: 1
  })
  .query({
    name: 'hello'
  })
  .then(function(res) {
    // fetch response
  })
  .catch(function(err) {
    // ...
  })

// get json body

request
  .get(path)
  .query({
    type: 1
  })
  .send({
    name: 'hello'
  })
  .json()
  .then(function(data) {
    // response body
  })
  .catch(function(err) {
    // ...
  })

// get text body

request
  .get(path)
  .query({
    type: 1
  })
  .send({
    name: 'hello'
  })
  .text()
  .then(function(data) {
    // response body
  })
  .catch(function(err) {
    // ...
  })

// send json

request
  .post(path)
  .send({
    type: 1
  })
  .send({
    name: 'hello'
  })
  .then(function(res) {
    // fetch response
  })
  .catch(function(err) {
    // ...
  })

// send urlencoded

request
  .post(path)
  .send('type=1')
  .send('name=hello')
  .then(function(res) {
    // fetch response
  })
  .catch(function(err) {
    // ...
  })

// send urlencoded

request
  .post(path)
  .set('content-type', 'application/x-www-form-urlencoded')
  .send({
    type: 1,
    name: 'hello'
  })
  .then(function(res) {
    // fetch response
  })
  .catch(function(err) {
    // ...
  })

// set header

request
  .post(path)
  .set({
    'content-type': 'application/json'
  })
  .send({
    type: 1
  })
  .send({
    name: 'hello'
  })
  .then(function(res) {
    // fetch response
  })
  .catch(function(err) {
    // ...
  })

// send form (upload file)

request
  .post(path)
  .append({
    filename: 'user.png'
  })
  .append({
    file: document.querySelector('input[type="file"]')files[0]
  })
  .then(function(res) {
    // fetch response
  })
  .catch(function(err) {
    // ...
  })
```

### License
MIT

[npm-img]: https://img.shields.io/npm/v/fetch.io.svg?style=flat-square
[npm-url]: https://npmjs.org/package/fetch.io
[travis-img]: https://img.shields.io/travis/haoxins/fetch.io.svg?style=flat-square
[travis-url]: https://travis-ci.org/haoxins/fetch.io
[coveralls-img]: https://img.shields.io/coveralls/haoxins/fetch.io.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/haoxins/fetch.io?branch=master
[license-img]: https://img.shields.io/badge/license-MIT-green.svg?style=flat-square
[license-url]: http://opensource.org/licenses/MIT
[david-img]: https://img.shields.io/david/haoxins/fetch.io.svg?style=flat-square
[david-url]: https://david-dm.org/haoxins/fetch.io
