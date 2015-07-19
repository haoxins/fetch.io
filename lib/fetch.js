'use strict'

/**
 * exports
 */

module.exports = Fetch

function Fetch(options) {
  if (!(this instanceof Fetch)) {
    return new Fetch(options)
  }

  this.options = options || {}
}

var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

methods.forEach(function(method) {
  method = method.toLowerCase()
  Fetch.prototype[method] = function(url) {
    // deep clone
    var opts = JSON.parse(JSON.stringify(this.options))
    return new Request(method, url, opts)
  }
})

function Request(method, url, options) {
  method = method.toUpperCase()
  if (typeof url !== 'string') {
    throw new TypeError('invalid url')
  }

  options = this.options = options || {}
  var prefix = options.prefix || ''
  this.url = prefix + url

  options.method = method
  options.mode = options.mode || 'cors'
  options.cache = options.cache || 'no-cache'
  options.credentials = options.credentials || 'same-origin'

  // fetch will normalize the headers
  var headers = options.headers = options.headers || {}
  options.query = options.query || {}

  for (var h in headers) {
    if (h !== h.toLowerCase()) {
      headers[h.toLowerCase()] = headers[h]
      delete headers[h]
    }
  }
}

/**
 * Set Options
 *
 * Examples:
 *
 *   .config('credentials', 'omit')
 *   .config({ credentials: 'omit' })
 *
 * @param {String|Object} key
 * @param {Any} value
 * @return {Request}
 */
Request.prototype.config = function(key, value) {
  var options = this.options

  if (typeof key === 'object') {
    for (var k in key) {
      options[k] = key[k]
    }
  } else {
    options[key] = value
  }

  return this
}

/**
 * Set header
 *
 * Examples:
 *
 *   .set('Accept', 'application/json')
 *   .set({ Accept: 'application/json' })
 *
 * @param {String|Object} key
 * @param {String} value
 * @return {Request}
 */
Request.prototype.set = function(key, value) {
  var headers = this.options.headers

  if (typeof key === 'object') {
    for (var k in key) {
      headers[k.toLowerCase()] = key[k]
    }
  } else {
    headers[key.toLowerCase()] = value
  }

  return this
}

/**
 * Add query string
 *
 * @param {Object} object
 * @return {Request}
 */
Request.prototype.query = function(object) {
  var query = this.options.query

  for (var i in object) {
    query[i] = object[i]
  }

  return this
}

/**
 * Send data
 *
 * Examples:
 *
 *   .send('name=hello')
 *   .send({ name: 'hello' })
 *
 * @param {String|Object} data
 * @return {Request}
 */
Request.prototype.send = function(data) {
  var type = this.options.headers['content-type']

  if (isObject(data) && isObject(this._body)) {
    // merge body
    for (var key in data) {
      this._body[key] = data[key]
    }
  } else if (typeof data === 'string') {
    if (!type) {
      this.options.headers['content-type'] = type = 'application/x-www-form-urlencoded'
    }

    if (type.indexOf('x-www-form-urlencoded') !== -1) {
      this._body = this._body ? this._body + '&' + data : data
    } else {
      this._body = (this._body || '') + data
    }
  } else {
    this._body = data
  }

  // default to json
  if (!type) {
    this.options.headers['content-type'] = 'application/json'
  }

  return this
}

/**
 * Append formData
 *
 * Examples:
 *
 *   .append(name, 'hello')
 *
 * @param {String} key
 * @param {String} value
 * @return {Request}
 */
Request.prototype.append = function(key, value) {
  if (!(this._body instanceof FormData)) {
    this._body = new FormData()

    if (isNode()) {
      var headers = this._body.getHeaders()
      if (headers && headers['content-type']) {
        this.options.headers['content-type'] = headers['content-type']
      }
    }
  }

  this._body.append(key, value)

  return this
}

memo(Request.prototype, 'promise', function() {
  var options = this.options
  var url = this.url

  try {
    if (['GET', 'HEAD', 'OPTIONS'].indexOf(options.method.toUpperCase()) === -1) {
      if (this._body instanceof FormData) {
        options.body = this._body
      } else if (isObject(this._body) && isJsonType(options.headers['content-type'])) {
        options.body = JSON.stringify(this._body)
      } else if (isObject(this._body)) {
        options.body = stringify(this._body)
      } else {
        options.body = this._body
      }
    }

    if (isObject(options.query)) {
      if (url.indexOf('?') >= 0) {
        url += '&' + stringify(options.query)
      } else {
        url += '?' + stringify(options.query)
      }
    }
  } catch (e) {
    return Promise.reject(e)
  }

  return fetch(url, options)
})

Request.prototype.then = function(resolve, reject) {
  return this.promise.then(resolve, reject)
}

Request.prototype.catch = function(reject) {
  return this.promise.catch(reject)
}

Request.prototype.json = function() {
  return this.promise.then(function(res) {
    return res.json()
  })
}

Request.prototype.text = function() {
  return this.promise.then(function(res) {
    return res.text()
  })
}

function isObject(obj) {
  // not null
  return obj && typeof obj === 'object'
}

function isJsonType(contentType) {
  return contentType && contentType.indexOf('application/json') === 0
}

function stringify(obj) {
  return Object.keys(obj).map(function(key) {
    return key + '=' + obj[key]
  }).join('&')
}

function isNode() {
  return typeof process === 'object'
}

function memo(object, property, getter) {
  Object.defineProperty(object, property, {
    get: function() {
      this[property] = getter.call(this)
      return this[property]
    },
    set: function(val) {
      Object.defineProperty(this, property, {
        value: val,
        configurable: true,
        writable: true
      })
    },
    configurable: true
  })

  return object
}
