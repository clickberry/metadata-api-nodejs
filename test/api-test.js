var app = require('..');
var request = require('supertest');
var assert = require('assert');
var uuid = require('node-uuid');

function createItem(id, json, fn) {
  request(app)
    .post('/' + id)
    .send(json)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .end(function (err, res) {
      fn(err, res.body);
    });
}

describe('GET /', function () {
  var id = uuid.v4();
  it('get unexisting metadata', function (done) {
    request(app)
      .get('/' + id)
      .expect(404, done);
  });
});

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

  it('query by id', function (done) {
    request(app)
      .get('/' + metadata.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(metadata, done);
  });
});

describe('PUT /', function () {
  var json = { 'prop1': 'val1', 'prop2': 'val2' };

  after(function (done) {
    request(app)
      .del('/' + json.id)
      .expect(200)
      .end(done);
  });

  it('create metadata', function (done) {
    var id = uuid.v4();
    createItem(id, json, function (err, data) {
      if (err) { return done(err); }
      json = data;
      done();
    });
  });

  it('updating metadata', function (done) {
    json.prop1 = "newval1";
    request(app)
      .put('/' + json.id)
      .send(json)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });

  it('get updated metadata', function (done) {
    request(app)
      .get('/' + json.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(json, done);
  });
});

describe('DELETE /', function () {
  var metadata = {};
  var id = uuid.v4();
  it('create metadata', function (done) {
    createItem(id, null, function (err, data) {
      if (err) { return done(err); }
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
