
'use strict';

let express = require('express');
let router = express.Router();


router.post('/api/register', require('../controller/register'));

let loginController = require('../controller/login');
router.post('/api/login', loginController.login);
router.get('/api/logout', loginController.logout);



module.exports = router;
