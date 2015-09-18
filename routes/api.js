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

      var metadata = new Metadata(req.body);
      metadata.id = req.params.id;
      metadata.save(function (err) {
        if (err) { return next(err); }
        debug("Metadata created: " + JSON.stringify(metadata));
        res.status(201).send(metadata);
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
      res.json(data);
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

      var metadata = new Metadata(req.body);
      metadata.id = req.params.id;
      metadata.update(function (err) {
        if (err) { return next(err); }
        debug("Metadata updated: " + JSON.stringify(metadata));
        res.send(metadata);
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
        debug("Metadata deleted: " + JSON.stringify(data));
        res.send();
      });
    });
  });

module.exports = router;
