var url = require("url");
var path = require("path");
var express = require('express');
var router = express.Router();
var Metadata = require('../lib/metadata');
var MetadataModel = require('../lib/metadata-model');
var debug = require('debug')('clickberry:metadata:api');
var passport = require('passport');
require('../config/jwt')(passport);
var multiparty = require('multiparty');
var AWS = require('aws-sdk'); 
var s3 = new AWS.S3();
var bucket = process.env.S3_BUCKET;
var uuid = require('node-uuid');

router.get('/heartbeat', function (req, res) {
  res.send();
});

router.get('/:id',
  function (req, res, next) {
    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      var metadataModel = MetadataModel.create();
      metadataModel.update(data);
      res.json(metadataModel.toJSON());
    });
  });

router.post('/:id',
  //passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  function (req, res, next) {
    /*if (req.payload.userId !== req.params.ownerId ||
          req.payload.objectId !== req.params.id) {
      return res.status(403).send();
    }*/

    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (data) {
        return res.status(409).send({ message: 'Conflict. Metadata is already exists!' });
      }

      var metadata = new Metadata({
        id: req.params.id,
        attributes: req.body.attributes
      });

      // upload blob
      var key = uuid.v4();
      var form = new multiparty.Form();
      var destPath;
      form.on('part', function(part) {
        s3.putObject({
          Bucket: bucket,
          Key: key,
          ACL: 'public-read',
          Body: part,
          ContentLength: part.byteCount
        }, function(err, data) {
          if (err) { return next(err); }

          var url = 'https://s3.amazonaws.com/' + bucket + '/' + key;
          debug("Metadata file uploaded to " + url);          

          // validate model
          metadata.url = url;
          var metadataModel = MetadataModel.create();
          metadataModel.update(metadata, '*');

          metadataModel.validate().then(function () {
            if (metadataModel.isValid) {
              metadata.save(function (err) {
                if (err) { return next(err); }
                res.status(201).send();
              });
            } else {
              res.status(400).send({ errors: metadataModel.errors });
            }
          });
        });
      });
      form.parse(req);
    });
  });

router.put('/:id',
  //passport.authenticate('access-token', { session: false, assignProperty: 'payload' }),
  function (req, res, next) {
    /*if (req.payload.userId !== req.params.ownerId ||
          req.payload.objectId !== req.params.id) {
      return res.status(403).send();
    }*/

    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      var metadata = new Metadata({
        id: req.params.id,
        url: data.url, // preserve original url
        attributes: req.body.attributes
      });

      // todo: update file

      // validate model
      var metadataModel = MetadataModel.create();
      metadataModel.update(data, '*');

      metadataModel.validate().then(function () {
        if (metadataModel.isValid) {
          metadata.update(function (err) {
            if (err) { return next(err); }
            res.send();
          });
        } else {
          res.status(400).send({ errors: metadataModel.errors });
        }
      });
    });
  });

router.delete('/:id', function (req, res, next) {
    Metadata.get(req.params.id, function (err, data) {
      if (err) { return next(err); }
      if (!data) {
        return res.status(404).send({ message: 'Resource not found' });
      }

      Metadata.del(req.params.id, function (err) {
        if (err) { return next(err); }

        var parsedUrl = url.parse(data.url);
        var key = path.basename(parsed.pathname);

        debug("File name: " + key);

        // delete file
        s3.deleteObject({
          Bucket: bucket,
          Key: key,
        }, function(err, data) {
          if (err) { return next(err); }
          res.send();
        });
      });
    });    
  });

module.exports = router;
