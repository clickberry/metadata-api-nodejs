// env
if (!process.env.TOKEN_ACCESSSECRET) {
  console.log("TOKEN_ACCESSSECRET environment variable required.");
  process.exit(1);
}

var JwtStrategy = require('passport-jwt').Strategy;

module.exports = function (passport) {
  passport.use('access-token', new JwtStrategy({
    secretOrKey: process.env.TOKEN_ACCESSSECRET
  }, function (jwtPayload, done) {
    done(null, jwtPayload);
  }));
};