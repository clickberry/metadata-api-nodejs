// env
if (!process.env.TOKEN_RELATIONSECRET) {
  console.log("TOKEN_RELATIONSECRET environment variable required.");
  process.exit(1);
}

var jwt = require('jsonwebtoken');

exports.extractPayload = function (tokenParamName, payloadParamName) {
  return function (req, res, next) {
    jwt.verify(req.query[tokenParamName], process.env.TOKEN_RELATIONSECRET, function (err, payload) {
      if (err) { return next(err); }

      req[payloadParamName] = payload;
      next();
    });
  };
};

exports.checkOwner = function (payloadName, relationName, relationIdParamName) {
  return function (req, res, next) {
    if (req[relationName].ownerId !== req[payloadName].userId) {
      return res.status(403).send();
    }
    if (req[relationName].id !== req.params[relationIdParamName]) {
      return res.status(403).send();
    }
    next();
  };
};