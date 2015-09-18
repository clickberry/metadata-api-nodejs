// env
if (!process.env.TOKEN_ACCESSSECRET) {
  console.log("TOKEN_ACCESSSECRET environment variable required.");
  process.exit(1);
}
if (!process.env.TOKEN_RELATIONSECRET) {
  console.log("TOKEN_RELATIONSECRET environment variable required.");
  process.exit(1);
}

var app = require('..');
var request = require('supertest');
var assert = require('assert');
var uuid = require('node-uuid');
var jwt = require('jsonwebtoken');

function getAuthToken(userId) {
  return jwt.sign({ userId: userId }, process.env.TOKEN_ACCESSSECRET);
}

function getRelationToken(id, userId) {
  return jwt.sign({ id: id, ownerId: userId }, process.env.TOKEN_RELATIONSECRET);
}

function createItem(id, json, fn) {
  var userId = uuid.v4();
  var auth_token = getAuthToken(userId);
  var relation_token = getRelationToken(id, userId);

  request(app)
    .post('/' + id + '?auth_token=' + auth_token + '&relation_token=' + relation_token)
    .send(json)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .end(function (err, res) {
      fn(err, { body: res.body, auth_token: auth_token, relation_token: relation_token });
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
  var metadata_auth_token;
  var metadata_relation_token;

  after(function (done) {
    request(app)
      .del('/' + metadata.id + '?auth_token=' + metadata_auth_token + '&relation_token=' + metadata_relation_token)
      .expect(200, done);
  });

  it('create metadata without authorization', function (done) {
    var id = uuid.v4();
    request(app)
      .post('/' + id)
      .send({})
      .expect(401, done);
  });

  it('create metadata by non-owner', function (done) {
    var id = uuid.v4();
    var userId = uuid.v4();
    var nonOwnerId = uuid.v4();
    var auth_token = getAuthToken(userId);
    var relation_token = getRelationToken(id, nonOwnerId);

    request(app)
      .post('/' + id + '?auth_token=' + auth_token + '&relation_token=' + relation_token)
      .send({})
      .expect(403, done);
  });

  it('create metadata for different object', function (done) {
    var id = uuid.v4();
    var differentId = uuid.v4();
    var userId = uuid.v4();
    var auth_token = getAuthToken(userId);
    var relation_token = getRelationToken(differentId, userId);

    request(app)
      .post('/' + id + '?auth_token=' + auth_token + '&relation_token=' + relation_token)
      .send({})
      .expect(403, done);
  });

  it('create metadata', function (done) {
    var id = uuid.v4();
    createItem(id, { 'prop1': 'val1', 'prop2': 'val2' }, function (err, data) {
      if (err) { return done(err); }
      metadata = data.body;
      metadata_auth_token = data.auth_token;
      metadata_relation_token = data.relation_token;
      done();
    });
  });

  it('create for already existing object', function (done) {
    var userId = uuid.v4();
    var auth_token = getAuthToken(userId);
    var relation_token = getRelationToken(metadata.id, userId);

    request(app)
      .post('/' + metadata.id + '?auth_token=' + auth_token + '&relation_token=' + relation_token)
      .send({})
      .expect(409, done);
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
  var metadata = { 'prop1': 'val1', 'prop2': 'val2' };
  var metadata_auth_token;
  var metadata_relation_token;

  after(function (done) {
    request(app)
      .del('/' + metadata.id + '?auth_token=' + metadata_auth_token + '&relation_token=' + metadata_relation_token)
      .expect(200)
      .end(done);
  });

  it('create metadata', function (done) {
    var id = uuid.v4();
    createItem(id, metadata, function (err, data) {
      if (err) { return done(err); }
      metadata = data.body;
      metadata_auth_token = data.auth_token;
      metadata_relation_token = data.relation_token;
      done();
    });
  });

  it('update non-owned metadata', function (done) {
    request(app)
      .put('/' + uuid.v4() + '?auth_token=' + metadata_auth_token + '&relation_token=' + metadata_relation_token)
      .send(metadata)
      .expect(403)
      .end(done);
  });

  it('update metadata', function (done) {
    metadata.prop1 = "newval1";
    request(app)
      .put('/' + metadata.id + '?auth_token=' + metadata_auth_token + '&relation_token=' + metadata_relation_token)
      .send(metadata)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .end(done);
  });

  it('get updated metadata', function (done) {
    request(app)
      .get('/' + metadata.id)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(metadata, done);
  });
});

describe('DELETE /', function () {
  var metadata = {};
  var metadata_auth_token;
  var metadata_relation_token;
  var id = uuid.v4();

  it('create metadata', function (done) {
    createItem(id, null, function (err, data) {
      if (err) { return done(err); }
      metadata = data.body;
      metadata_auth_token = data.auth_token;
      metadata_relation_token = data.relation_token;
      done();
    });
  });

  it('delete metadata without authorization', function (done) {
    request(app)
      .del('/' + metadata.id)
      .expect(401, done);
  });

  it('delete metadata by non-owner', function (done) {
    var auth_token = getAuthToken(uuid.v4());
    request(app)
      .del('/' + metadata.id + '?auth_token=' + auth_token + '&relation_token=' + metadata_relation_token)
      .expect(403, done);
  });

  it('delete metadata', function (done) {
    request(app)
      .del('/' + metadata.id + '?auth_token=' + metadata_auth_token + '&relation_token=' + metadata_relation_token)
      .expect(200, done);
  });
});
