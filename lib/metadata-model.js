var model = require('nodejs-model');

var Metadata = model("Metadata").attr('id', {
  validations: {
    presence: {
      message: 'Id is required!'
    }
  }
}).attr('url', {
  validations: {
    presence: {
      message: 'Url is required!'
    }
  }
}).attr('attributes');

module.exports = Metadata;