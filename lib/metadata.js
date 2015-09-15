var redis = require('redis');
var db = redis.createClient(parseInt(process.env.REDIS_PORT, 10) || 6379, 
  process.env.REDIS_ADDRESS);

function Metadata(obj) {
  var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      this[key] = obj[key];
    }
  }
}

Metadata.get = function (id, fn) {
  db.hgetall('metadata:' + id, function (err, data) {
    if (err) { return fn(err); }
    if (!data) { return fn(); }
    fn(null, new Metadata(data));
  });
};

Metadata.prototype.save = function (fn) {
  var metadata = this;
  var id = metadata.id;

  if (!id) {
    return fn(new Error('Metadata id required!'));
  }

  Metadata.get(id, function (err, original) {
    if (err) { return fn(err); }
    if (original) {
      // existing metadata
      return metadata.update(fn);
    }

    // add new metadata
    db.hmset('metadata:' + id, metadata, function (err) {
      fn(err);
    });
  });
};

Metadata.prototype.update = function (fn) {
  var metadata = this;
  var id = metadata.id;

  Metadata.get(id, function (err, data) {
    if (err) { return fn(err); }
    if (!data) {
      return fn(new Error('Metadata with id ' + id + ' does not exist.'));
    }

    // update metadata
    db.hmset('metadata:' + id, metadata, function (err) {
      fn(err);
    });
  });
};

Metadata.del = function (id, fn) {
  Metadata.get(id, function (err, data) {
    if (err) { return fn(err); }

    // delete meta-data
    db.del('metadata:' + id, function (err) {
      if (err) { return fn(err); }
      fn(null, data);
    });
  });
};

Metadta.prototype.toJSON = function () {
  return {
    id: this.id,
    url: this.url,
    attributes: this.attributes
  };
};

module.exports = Metadata;