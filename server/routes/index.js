var express = require('express');
var router = express.Router();
/*var jwt = require('express-jwt');
var auth = jwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'payload'
});*/

var sendJsonResponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};


router.get('/test_session', function(req, res){
    console.log('get /');

    var sess = req.session;
    if (sess.views) {
        sess.views++;
        sess.data += sess.data;
    } else {
        sess.views = 1;
        sess.data = 'ab';
    }
    sendJsonResponse(res, 200, {session: req.session});
    
    console.log('done');
});

router.post('/test', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/api/register', require('../controller/register'));
//router.post('/api/login', authController.login);

module.exports = router;
