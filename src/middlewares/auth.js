const passport = require('passport');

module.exports = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Please authenticate' });
    }
    req.user = user;
    next();
  })(req, res, next);
};