'use strict'

const assert = require('assert')
const equal = assert.strictEqual
const Fetch = require('..')

function keysEqual(obj, keys) {
  assert.deepEqual(Object.keys(obj).sort(), keys.sort())
}

describe('## fetch.io', function() {
  const jsonType = 'application/json'
  const host = 'http://httpbin.org'

  let request = new Fetch()

  it('invalid url', function() {
    try {
      request.get()
    } catch (e) {
      equal(e.message, 'invalid url')
    }
  })

  describe('# query', function() {
    it('query()', function(done) {
      request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          keysEqual((body.args), ['name', 'pass', 'type'])
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })

    it('query() - merge url', function(done) {
      request
        .get(host + '/get?name=haoxin')
        .query({
          pass: 123456
        })
        .query({
          type: 1
        })
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          keysEqual(body.args, ['name', 'pass', 'type'])
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })

    it('json()', function(done) {
      request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .json()
        .then(function(body) {
          keysEqual(body.args, ['name', 'pass', 'type'])
          done()
        }).catch(function(err) {
          done(err)
        })
    })

    it('text()', function(done) {
      request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .text()
        .then(function(text) {
          equal(typeof text, 'string')
          let body = JSON.parse(text)
          keysEqual(body.args, ['name', 'pass', 'type'])
          done()
        }).catch(function(err) {
          done(err)
        })
    })
  })

  describe('# send', function() {
    it('json', function(done) {
      request
        .post(host + '/post')
        .send({
          name: 'haoxin',
          pass: 123456
        })
        .send({
          type: 1
        })
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          equal(body.headers['Content-Type'], jsonType)
          keysEqual(body.json, ['name', 'pass', 'type'])
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })

    it('urlencoded', function(done) {
      request
        .post(host + '/post')
        .send('name=haoxin')
        .send('pass=123456')
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          keysEqual(body.form, ['name', 'pass'])
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })

    it.skip('get() should ignore body', function(done) {
      request
        .get(host + '/post')
        .send({
          name: 'haoxin',
          pass: 123456
        })
        .send({
          type: 1
        })
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          console.log(body)
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })
  })

  describe('# set', function() {
    it('set(key, value)', function(done) {
      request
        .post(host + '/post')
        .set('content-type', 'application/x-www-form-urlencoded')
        .set('x-fetch-io', 'hello')
        .send({
          name: 'haoxin'
        })
        .send({
          pass: 123456
        })
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          equal(body.headers['X-Fetch-Io'], 'hello')
          keysEqual(body.form, ['name', 'pass'])
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })

    it('set(obj)', function(done) {
      request
        .post(host + '/post')
        .set({
          'content-type': 'application/x-www-form-urlencoded',
          'x-fetch-io': 'hello'
        })
        .send({
          name: 'haoxin'
        })
        .send({
          pass: 123456
        })
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          equal(body.headers['X-Fetch-Io'], 'hello')
          keysEqual(body.form, ['name', 'pass'])
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })
  })

  describe('# append', function() {
    it('append(key, value)', function(done) {
      request
        .post(host + '/post')
        .append('name', 'haoxin')
        .append('desc', 'hello world')
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          assert.ok(body.headers['Content-Type'].startsWith('multipart/form-data'))
          keysEqual(body.form, ['name', 'desc'])
          equal(body.form.name, 'haoxin')
          equal(body.form.desc, 'hello world')
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })
  })

  describe('# prefix', function() {
    it('basic', function(done) {
      let req = new Fetch({
        prefix: host + '/get'
      })

      req
        .get('')
        .then(function(res) {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then(function(body) {
          equal(body.url, host + '/get')
          done()
        })
        .catch(function(err) {
          done(err)
        })
    })
  })
})
