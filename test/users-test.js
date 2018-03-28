/* eslint-env mocha */
'use strict'
var chai = require('chai')
var ZSchema = require('z-schema')
var customFormats = module.exports = function (zSchema) {
    // Placeholder file for all custom-formats in known to swagger.json
    // as found on
    // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#dataTypeFormat

  var decimalPattern = /^\d{0,8}.?\d{0,4}[0]+$/

    /** Validates floating point as decimal / money (i.e: 12345678.123400..) */
  zSchema.registerFormat('double', function (val) {
    return !decimalPattern.test(val.toString())
  })

    /** Validates value is a 32bit integer */
  zSchema.registerFormat('int32', function (val) {
        // the 32bit shift (>>) truncates any bits beyond max of 32
    return Number.isInteger(val) && ((val >> 0) === val)
  })

  zSchema.registerFormat('int64', function (val) {
    return Number.isInteger(val)
  })
  zSchema.registerFormat('float', function (val) {
        // should parse
    return Number.isInteger(val)
  })

  zSchema.registerFormat('date', function (val) {
        // should parse a a date
    return !isNaN(Date.parse(val))
  })

  zSchema.registerFormat('dateTime', function (val) {
    return !isNaN(Date.parse(val))
  })

  zSchema.registerFormat('password', function (val) {
        // should parse as a string
    return typeof val === 'string'
  })
}

customFormats(ZSchema)

var validator = new ZSchema({})
var request = require('request')

chai.should()
require('dotenv').load()

var baseURL = process.env.API_URL;
if(baseURL === null || baseURL === undefined) {
    baseURL = "http://localhost:3005"
}

describe('/users/data', function () {
    describe('POST', function () {
      it('should return ordered and filtered  users data ', function (done) {
        this.timeout(60000)
          var schema = {
                  "properties": {
                        "id": {
                            "type": "number"
                        },
                        "first_name": {
                            "type": "string"
                        },
                        "last_name": {
                            "type": "string"
                        },
                        "age": {
                            "type": "number"
                        },
                        "sex": {
                            "type": "string"
                        },
                        "phone": {
                            "type": "string"
                        }
                  },
                  "required": [   
                      "id"              
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
                body = JSON.parse(body)
                console.log(body.data)
                if (error) return done(error)

                if (body.hasOwnProperty('meta') && body.hasOwnProperty('rowId')) {
                    done()
                } else {
                    done(new Error("Does not contains meta or rowId properties"))
                }
            })
      })
    })
  })