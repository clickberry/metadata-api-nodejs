var app = require('..');
var request = require('supertest');
var assert = require('assert');
var uuid = require('node-uuid');

function createItem(id, attrs, fn) {
  request(app)    
    .post('/' + id)
    .timeout(5000)
    .field('attributes', JSON.stringify(attrs))
    .attach('avatar', 'test/files/test.json')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .end(function (err, res) {
      fn(err, res.body);
    });
  }

describe('POST /', function () {
  var metadata = {};

  after(function (done) {
    request(app)
      .del('/' + metadata.id)
      .expect(200)
      .end(done);
  });

  it('create metadata', function (done) {
    var id = uuid.v4();
    createItem(id, { 'prop1': 'val1', 'prop2': 'val2' }, function (err, data) {
      if (err) { return done(err); }
      metadata = data;
      done();
    });
  });

  it('trying to query by id and should receive the same metadata', function (done) {
    request(app)
      .get('/' + metadata.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(metadata, done);
  });
});

describe('DELETE /', function () {
    var metadata = {};
    var id = uuid.v4();
    it('create metadata', function (done) {
      createItem(id, null, function (err, data) {
        if (err) { return done(err) };
        metadata = data;
        done();
      });
    });

    it('delete it, should return 200 OK', function (done) {
      request(app)
        .del('/' + metadata.id)
        .expect(200, done);
    });
});
