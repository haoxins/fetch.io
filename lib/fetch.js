
const assign = Object.assign

/**
 * Request
 */

class Request {
  constructor(method, url, opts = {}) {
    method = method.toUpperCase()
    if (typeof url !== 'string') {
      throw new TypeError('invalid url')
    }

    const options = this.options = assign({}, {
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'include',
      headers: {},
      query: {}
    }, opts)

    const prefix = options.prefix || ''
    this.url = prefix + url

    options.method = method

    // fetch will normalize the headers
    const headers = options.headers

    for (let h in headers) {
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
  config(key, value) {
    const options = this.options

    if (typeof key === 'object') {
      for (let k in key) {
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
  set(key, value) {
    const headers = this.options.headers

    if (typeof key === 'object') {
      for (let k in key) {
        headers[k.toLowerCase()] = key[k]
      }
    } else {
      headers[key.toLowerCase()] = value
    }

    return this
  }

  /**
   * Set Content-Type
   *
   * @param {String} type
   */
  type(type) {
    switch (type) {
    case 'json':
      type = 'application/json'
      break
    case 'form':
    case 'urlencoded':
      type = 'application/x-www-form-urlencoded'
      break
    }

    this.options.headers['content-type'] = type

    return this
  }

  /**
   * Add query string
   *
   * @param {Object} object
   * @return {Request}
   */
  query(object) {
    const query = this.options.query

    for (let i in object) {
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
  send(data) {
    let type = this.options.headers['content-type']

    if (isObject(data) && isObject(this._body)) {
      // merge body
      for (let key in data) {
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
   * @param {String|Object} key
   * @param {String} value
   * @return {Request}
   */
  append(key, value) {
    if (!(this._body instanceof FormData)) {
      this._body = new FormData()

      if (isNode()) {
        const headers = this._body.getHeaders()
        if (headers && headers['content-type']) {
          this.options.headers['content-type'] = headers['content-type']
        }
      }
    }

    if (typeof key === 'object') {
      for (let k in key) {
        this._body.append(k, key[k])
      }
    } else {
      this._body.append(key, value)
    }

    return this
  }

  promise() {
    const { options } = this
    let { url } = this

    const {
      beforeRequest,
      afterResponse,
    } = options

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
      } else {
        delete options.headers['content-type']
      }

      if (isObject(options.query)) {
        if (url.indexOf('?') >= 0) {
          url += '&' + stringify(options.query)
        } else {
          url += '?' + stringify(options.query)
        }
      }

      if (beforeRequest) {
        const canceled = beforeRequest(url, options.body)
        if (canceled === false) {
          return Promise.reject(new Error('request canceled by beforeRequest'))
        }
      }
    } catch (e) {
      return Promise.reject(e)
    }

    if (afterResponse) {
      return fetch(url, options)
        .then(res => {
          return Promise.resolve(afterResponse(res))
            .then(() => res.clone())
        })
    }

    return fetch(url, options)
  }

  then(resolve, reject) {
    return this.promise().then(resolve, reject)
  }

  catch (reject) {
    return this.promise().catch(reject)
  }

  json(strict = true) {
    return this.promise()
    .then(res => res.json())
    .then(json => {
      if (strict && !isObject(json)) {
        throw new TypeError('response is not strict json')
      }

      if (this.options.afterJSON) {
        this.options.afterJSON(json)
      }

      return json
    })
  }

  text() {
    return this.promise().then(res => res.text())
  }
}

/**
 * Private utils
 */

function isObject(obj) {
  // not null
  return obj && typeof obj === 'object'
}

function isJsonType(contentType) {
  return contentType && contentType.indexOf('application/json') === 0
}

function stringify(obj) {
  obj = JSON.parse(JSON.stringify(obj))
  return Object.keys(obj).map(key => {
    return key + '=' + obj[key]
  }).join('&')
}

function isNode() {
  return typeof process === 'object' && process.title === 'node'
}

/**
 * Fetch
 */

function Fetch(options) {
  if (!(this instanceof Fetch)) {
    return new Fetch(options)
  }

  this.options = options || {}
}

const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH']

methods.forEach(method => {
  method = method.toLowerCase()
  Fetch.prototype[method] = function(url) {
    const opts = assign({}, this.options)
    return new Request(method, url, opts)
  }
})

/**
 * export
 */

module.exports = Fetch
