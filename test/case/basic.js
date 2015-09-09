'use strict'

const assert = require('assert')
const equal = assert.strictEqual

function keysEqual(obj, keys) {
  assert.deepEqual(Object.keys(obj).sort(), keys.sort())
}

module.exports = (Fetch) => {
  describe('## fetch.io', () => {
    const jsonType = 'application/json'
    const host = 'http://httpbin.org'

    const request = new Fetch()

    it('invalid url', () => {
      try {
        request.get()
      } catch (e) {
        equal(e.message, 'invalid url')
      }
    })

    describe('# query', () => {
      it('query()', (done) => {
        request
        .get(host + '/get')
        .query({
          name: 'haoxin',
          pass: 123456
        })
        .query({
          type: 1
        })
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          keysEqual((body.args), ['name', 'pass', 'type'])
          done()
        })
        .catch((err) => {
          done(err)
        })
      })

      it('query() - merge url', (done) => {
        request
        .get(host + '/get?name=haoxin')
        .query({
          pass: 123456
        })
        .query({
          type: 1
        })
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          keysEqual(body.args, ['name', 'pass', 'type'])
          done()
        })
        .catch((err) => {
          done(err)
        })
      })

      it('json()', (done) => {
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
        .then((body) => {
          keysEqual(body.args, ['name', 'pass', 'type'])
          done()
        }).catch((err) => {
          done(err)
        })
      })

      it('text()', (done) => {
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
        .then((text) => {
          equal(typeof text, 'string')
          let body = JSON.parse(text)
          keysEqual(body.args, ['name', 'pass', 'type'])
          done()
        }).catch((err) => {
          done(err)
        })
      })
    })

    describe('# send', () => {
      it('json', (done) => {
        request
        .post(host + '/post')
        .send({
          name: 'haoxin',
          pass: 123456
        })
        .send({
          type: 1
        })
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          equal(body.headers['Content-Type'], jsonType)
          keysEqual(body.json, ['name', 'pass', 'type'])
          done()
        })
        .catch((err) => {
          done(err)
        })
      })

      it('urlencoded', (done) => {
        request
        .post(host + '/post')
        .send('name=haoxin')
        .send('pass=123456')
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          keysEqual(body.form, ['name', 'pass'])
          done()
        })
        .catch((err) => {
          done(err)
        })
      })

      it.skip('get() should ignore body', (done) => {
        request
        .get(host + '/post')
        .send({
          name: 'haoxin',
          pass: 123456
        })
        .send({
          type: 1
        })
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          console.log(body)
          done()
        })
        .catch((err) => {
          done(err)
        })
      })
    })

    describe('# set', () => {
      it('set(key, value)', (done) => {
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
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          equal(body.headers['X-Fetch-Io'], 'hello')
          keysEqual(body.form, ['name', 'pass'])
          done()
        })
        .catch((err) => {
          done(err)
        })
      })

      it('set(obj)', (done) => {
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
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          equal(body.headers['Content-Type'], 'application/x-www-form-urlencoded')
          equal(body.headers['X-Fetch-Io'], 'hello')
          keysEqual(body.form, ['name', 'pass'])
          done()
        })
        .catch((err) => {
          done(err)
        })
      })
    })

    describe('# append', () => {
      it('append(key, value)', (done) => {
        request
        .post(host + '/post')
        .append('name', 'haoxin')
        .append('desc', 'hello world')
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          assert.ok(body.headers['Content-Type'].startsWith('multipart/form-data'))
          keysEqual(body.form, ['name', 'desc'])
          equal(body.form.name, 'haoxin')
          equal(body.form.desc, 'hello world')
          done()
        })
        .catch((err) => {
          done(err)
        })
      })
    })

    describe('# prefix', () => {
      it('basic', (done) => {
        let req = new Fetch({
          prefix: host + '/get'
        })

        req
        .get('')
        .then((res) => {
          equal(res.status, 200)
          equal(res.headers.get('Content-Type'), jsonType)
          return res.json()
        })
        .then((body) => {
          equal(body.url, host + '/get')
          done()
        })
        .catch((err) => {
          done(err)
        })
      })
    })
  })
}
