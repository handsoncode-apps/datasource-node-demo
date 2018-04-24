/* eslint-env mocha */
'use strict'
const ZSchema = require('z-schema');
const request = require('request');
const chai = require('chai');
const fs = require('fs');
let server;

const validator = new ZSchema({});
chai.should();

require('dotenv').load()

let baseURL = process.env.API_URL;
if (baseURL === null || baseURL === undefined) {
  baseURL = "http://localhost:3001"
}

before(function (done) {
  // rebuild database
  fs.unlink('database.db', function(){
    delete require.cache[require.resolve('../app')];
    server = require('../app').instanceApp;
    setTimeout(()=>{
      server.close();
      done();
    }, 1000)
  });
})

beforeEach(function(done){
  delete require.cache[require.resolve('../app')];
  server= require('../app');
  done();
})

afterEach(function (done) {
  server.close(done);
});

describe('POST /users/data', function () {
  it('should return ordered and filtered  users data ', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "array"
        },
        "meta": {
          "type": "object"
        },
        "rowId": {
          "type": "string"
        }
      },
      "required": [
        "data", "meta", "rowId"
      ],
      "additionalProperties": true
    }
    request({
      url: baseURL + '/users/data',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    function (error, res, body) {
      if (error) return done(error)
      let val = validator.validate(JSON.parse(body), schema)
      val.should.be.true


      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('POST /users/cell', function () {
  it('should update data ', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "string"
        }
      },
      "required": [
        "data"
      ],
      "additionalProperties": true
    }
    let data = {
      changes: [{
        row: 1, column: "first_name", oldValue: "John", newValue: "James",
        meta: { row: 1, col: 1, visualRow: 1, visualCol: 1, prop: 1, row_id: 2, col_id: "first_name" }, source: "edit"
      }]
    }
    request({
      url: baseURL + '/users/cell',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      json: data
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('PUT /users/row', function () {
  it('should create new row', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "object"
        },
        "id": {
          "type": "number"
        }
      },
      "required": [
        "data", "id"
      ],
      "additionalProperties": true
    }
    let data = {
      index: 5, amount: 1, source: "ContextMenu.rowBelow"
    }
    request({
      url: baseURL + '/users/row',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      json: data
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('DELETE /users/row', function () {
  it('should remove row', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "string"
        }
      },
      "required": [
        "data"
      ],
      "additionalProperties": true
    }
    let data = [6]
    request({
      url: baseURL + '/users/row',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      json: data
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('POST /users/row/move', function () {
  it('should move row to different position', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "string"
        }
      },
      "required": [
        "data"
      ],
      "additionalProperties": true
    }
    let data = { rowsMoved: [5], target: 3 }
    request({
      url: baseURL + '/users/row/move',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      json: data
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('PUT /users/column', function () {
  it('should create new column', function (done) {
    let schema = {
      "properties": {
        "name": {
          "type": "string"
        }
      },
      "required": [
        "name"
      ],
      "additionalProperties": true
    }
    let data = { index: 6, amount: 1, source: "ContextMenu.columnRight" }
    request({
      url: baseURL + '/users/column',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      json: data
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('POST /user/column/move', function () {
  it('should move column to different position', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "array"
        }
      },
      "required": [
        "data"
      ],
      "additionalProperties": true
    }
    let data = { columnNames: ["dynamic_1"], target: 5 }
    request({
      url: baseURL + '/users/column/move',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      json: data
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('GET /users/settings', function () {
  it('should return settings', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "object"
        }
      },
      "required": [
        "data"
      ],
      "additionalProperties": true
    }
    request({
      url: baseURL + '/users/settings',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

describe('DELETE /users/column', function () {
  it('should remove column', function (done) {
    let schema = {
      "properties": {
        "data": {
          "type": "string"
        }
      },
      "required": [
        "data"
      ],
      "additionalProperties": true
    }
    request({
      url: baseURL + '/users/column',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      json: ["dynamic_1"]
    },
    function (error, res, body) {
      if (error) return done(error)

      let val = validator.validate(body, schema)
      val.should.be.true

      res.statusCode.should.equal(200)
      done()
    })
  })
})

after(done => {
  done()
  process.exit(1)
})
