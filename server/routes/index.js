var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});

var authController = require('../controller/authentication');

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
