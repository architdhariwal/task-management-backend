const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), authController.googleAuthCallback);
router.get('/profile', auth, authController.getProfile);

module.exports = router;