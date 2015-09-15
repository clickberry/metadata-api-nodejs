var JwtStrategy = require('passport-jwt').Strategy;

module.exports = function (passport) {
  passport.use('access-token', new JwtStrategy({
    secretOrKey: process.env.TOKEN_ACCESSSECRET
  }, function (jwtPayload, done) {
    done(null, jwtPayload);
  }));
};