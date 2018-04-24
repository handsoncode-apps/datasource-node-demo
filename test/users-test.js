/* eslint-env mocha */

const ZSchema = require('z-schema');
const request = require('request');
const chai = require('chai');
const fs = require('fs');

let server;

const validator = new ZSchema({});
chai.should();

require('dotenv').load();

let baseURL = process.env.API_URL;
if (baseURL === null || baseURL === undefined) {
  baseURL = 'http://localhost:3001';
}

before((done) => {
  // rebuild database
  fs.unlink('database.db', () => {
    delete require.cache[require.resolve('../app')];
    server = require('../app').instanceApp;
    setTimeout(() => {
      server.close();
      done();
    }, 1000);
  });
});

beforeEach((done) => {
  delete require.cache[require.resolve('../app')];
  server = require('../app').instanceApp;
  done();
});

afterEach((done) => {
  server.close(done);
});

describe('POST /users/data', () => {
  it('should return ordered and filtered  users data ', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'array'
        },
        meta: {
          type: 'object'
        },
        rowId: {
          type: 'string'
        }
      },
      required: [
        'data', 'meta', 'rowId'
      ],
      additionalProperties: true
    };
    request(
      {
        url: `${baseURL}/users/data`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      (error, res, body) => {
        if (error) { return done(error); };
        let val = validator.validate(JSON.parse(body), schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('POST /users/cell', () => {
  it('should update data ', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'string'
        }
      },
      required: [
        'data'
      ],
      additionalProperties: true
    };
    let data = {
      changes: [{
        row: 1,
        column: 'first_name',
        oldValue: 'John',
        newValue: 'James',
        meta: {
          row: 1, col: 1, visualRow: 1, visualCol: 1, prop: 1, row_id: 2, col_id: 'first_name'
        },
        source: 'edit'
      }]
    };
    request(
      {
        url: `${baseURL}/users/cell`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        json: data
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        return done();
      }
    );
  });
});

describe('PUT /users/row', () => {
  it('should create new row', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'object'
        },
        id: {
          type: 'number'
        }
      },
      required: [
        'data', 'id'
      ],
      additionalProperties: true
    };
    let data = {
      index: 5, amount: 1, source: 'ContextMenu.rowBelow'
    };
    request(
      {
        url: `${baseURL}/users/row`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        json: data
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('DELETE /users/row', () => {
  it('should remove row', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'string'
        }
      },
      required: [
        'data'
      ],
      additionalProperties: true
    };
    let data = [6];
    request(
      {
        url: `${baseURL}/users/row`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        json: data
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('POST /users/row/move', () => {
  it('should move row to different position', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'string'
        }
      },
      required: [
        'data'
      ],
      additionalProperties: true
    };
    let data = { rowsMoved: [5], target: 3 };
    request(
      {
        url: `${baseURL}/users/row/move`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        json: data
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('PUT /users/column', () => {
  it('should create new column', (done) => {
    let schema = {
      properties: {
        name: {
          type: 'string'
        }
      },
      required: [
        'name'
      ],
      additionalProperties: true
    };
    let data = { index: 6, amount: 1, source: 'ContextMenu.columnRight' };
    request(
      {
        url: `${baseURL}/users/column`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        json: data
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('POST /user/column/move', () => {
  it('should move column to different position', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'array'
        }
      },
      required: [
        'data'
      ],
      additionalProperties: true
    };
    let data = { columnNames: ['dynamic_1'], target: 5 };
    request(
      {
        url: `${baseURL}/users/column/move`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        json: data
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('GET /users/settings', () => {
  it('should return settings', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'object'
        }
      },
      required: [
        'data'
      ],
      additionalProperties: true
    };
    request(
      {
        url: `${baseURL}/users/settings`,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

describe('DELETE /users/column', () => {
  it('should remove column', (done) => {
    let schema = {
      properties: {
        data: {
          type: 'string'
        }
      },
      required: [
        'data'
      ],
      additionalProperties: true
    };
    request(
      {
        url: `${baseURL}/users/column`,
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        json: ['dynamic_1']
      },
      (error, res, body) => {
        if (error) { return done(error); };

        let val = validator.validate(body, schema);
        val.should.be.true;

        res.statusCode.should.equal(200);
        done();
      }
    );
  });
});

after((done) => {
  done();
  process.exit(1);
});
