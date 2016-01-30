
'use strict';

let express = require('express');
let router = express.Router();


// register, login and logout
router.post('/api/register', require('../controller/register'));

let loginController = require('../controller/login');
router.post('/api/login', loginController.login);
router.get('/api/logout', loginController.logout);


// admin
let Administrator = require('../controller/admin');
router.get('/api/admin/users', Administrator.getUsers);
router.post('/api/admin/grant', Administrator.grantUser);


// manage course
let CourseManager = require('../controller/course_manager');
router.post('/api/course', CourseManager.createCourse);

module.exports = router;
