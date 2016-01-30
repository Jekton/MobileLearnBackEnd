
'use strict';

let express = require('express');
let router = express.Router();


// register, login and logout
router.post('/api/register', require('../controller/register'));

let loginController = require('../controller/login');
router.post('/api/login', loginController.login);
router.get('/api/logout', loginController.logout);


// admin
let adminControlller = require('../controller/admin');
router.get('/api/admin/users', adminControlller.getUsers);


module.exports = router;
