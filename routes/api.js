var url = require("url");
var path = require("path");
var debug = require('debug')('clickberry:metadata:api');
var Metadata = require('../lib/metadata');
var permissions = require('../middleware/permissions');

var express = require('express');
var router = express.Router();

// passport
var passport = require('passport');
require('../config/jwt')(passport);

router.get('/heartbeat', function (req, res) {
  res.send();
});

router.post('/:id',
  passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  permissions.extractPayload('relation_token', 'relation'),
  permissions.checkOwner('payload', 'relation', 'id'),
  function (req, res, next) {
    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (data) {
        return res.status(409).send({ message: 'Conflict. Metadata is already exists!' });
      }

      var json = req.body;
      var metadata = new Metadata({ json: JSON.stringify(json) });
      metadata.id = req.params.id;
      metadata.save(function (err) {
        if (err) { return next(err); }
        var result = json;
        result.id = metadata.id;
        debug("Metadata created: " + JSON.stringify(result));
        res.status(201).send(result);
      });
    });
  });

router.get('/:id',
  function (req, res, next) {
    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      var json = JSON.parse(data.json);
      json.id = req.params.id;
      res.json(json);
    });
  });

router.put('/:id',
  passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  permissions.extractPayload('relation_token', 'relation'),
  permissions.checkOwner('payload', 'relation', 'id'),
  function (req, res, next) {
    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      var json = req.body;
      var metadata = new Metadata({ json: JSON.stringify(json) });
      metadata.id = req.params.id;
      metadata.update(function (err) {
        if (err) { return next(err); }
        var result = json;
        result.id = metadata.id;
        debug("Metadata updated: " + JSON.stringify(result));
        res.send(result);
      });
    });
  });

router.delete('/:id',
  passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  permissions.extractPayload('relation_token', 'relation'),
  permissions.checkOwner('payload', 'relation', 'id'),
  function (req, res, next) {
    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      Metadata.del(req.params.id, function (err) {
        if (err) { return next(err); }
        var result = JSON.parse(data.json);
        result.id = req.params.id;
        debug("Metadata deleted: " + JSON.stringify(result));
        res.send();
      });
    });
  });

module.exports = router;
