/* eslint-env mocha */
'use strict'
var chai = require('chai')
const should = chai.should();
var ZSchema = require('z-schema')
const request = require('request')

var validator = new ZSchema({})

require('dotenv').load()

var baseURL = process.env.API_URL;
if(baseURL === null || baseURL === undefined) {
    baseURL = "http://localhost:3000"
}

let server; 
before(function(done) {
    const app = require('../app');
    setTimeout(done, 1000);
})

describe('POST /users/data', function () {
    it('should return ordered and filtered  users data ', function (done) {
        var schema = {
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
            }},
            function (error, res, body) {
                if (error) return done(error)
                
                let val = validator.validate(JSON.parse(body), schema)
                val.should.be.true

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/update', function () {
    it('should update data ', function (done) {
        var schema = {
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
        var data = {
            changes: [{ row: 1, column: "first_name", oldValue: "John", newValue: "James", 
                meta: {row: 1, col: 1, visualRow: 1, visualCol: 1, prop: 1, row_id: 2, col_id: "first_name"}, source: "edit" }]
        }
        request({
            url: baseURL + '/users/update',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: data},
            function (error, res, body) {
                if (error) return done(error)

                let val = validator.validate(body, schema)
                val.should.be.true

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/create/row', function () {
    it('should create new row', function (done) {
        var schema = {
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
        var data = {
            index: 5, amount: 1, source: "ContextMenu.rowBelow"
        }
        request({
            url: baseURL + '/users/create/row',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: data},
            function (error, res, body) {
                if (error) return done(error)
                
                let val = validator.validate(body, schema)
                val.should.be.true

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/remove/row', function () {
    it('should remove row', function (done) {
        var schema = {
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
        var data = [6]
        request({
            url: baseURL + '/users/remove/row',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: data},
            function (error, res, body) {
                if (error) return done(error)
                
                let val = validator.validate(body, schema)
                val.should.be.true

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/move/row', function () {
    it('should move row to different position', function (done) {
        var schema = {
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
        var data = { rowsMoved: [5], target: 3}
        request({
            url: baseURL + '/users/move/row',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: data},
            function (error, res, body) {
                if (error) return done(error)
                
                let val = validator.validate(body, schema)
                val.should.be.true

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/create/column', function () {
    it('should create new column', function (done) {
        var schema = {
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
        var data = { index: 6, amount: 1, source: "ContextMenu.columnRight" }
        request({
            url: baseURL + '/users/create/column',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: data},
            function (error, res, body) {
                if (error) return done(error)
                
                let val = validator.validate(body, schema)
                val.should.be.true

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/move/column', function () {
    it('should move column to different position', function (done) {
        var schema = {
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
        var data = { columnNames: ["dynamic_1"], target: 5}
        request({
            url: baseURL + '/users/move/column',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: data},
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
        var schema = {
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
            }},
            function (error, res, body) {
                if (error) return done(error)
                
                let val = validator.validate(body, schema)
                val.should.be.true                

                res.statusCode.should.equal(200)
                done()
        })
    })
})

describe('POST /users/remove/column', function () {
    it('should remove column', function (done) {
        var schema = {
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
            url: baseURL + '/users/remove/column',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            json: ["dynamic_1"]},
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