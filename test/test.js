var assert = require('assert')
  , mongo = require('mongodb')
  , db = require('../db');

describe("DB", function() {
  describe('ID(string)', function() {
    it('should equals a BSONPure.ObjectID', function() {
      assert.equal(true, mongo.BSONPure.ObjectID('123456789012').equals(db.ID('123456789012')));
    })
  })
})

