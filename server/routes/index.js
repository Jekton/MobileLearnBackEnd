'use strict';

let express = require('express');
let router = express.Router();

let multer  = require('multer');
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({ storage: storage });



// register, login and logout
router.post('/api/register', require('../controller/register'));

let loginController = require('../controller/login');
router.post('/api/login', loginController.login);
router.get('/api/logout', loginController.logout);


// admin
let Administrator = require('../controller/admin');
router.get('/api/admin/users', Administrator.getUsers);
router.post('/api/admin/grant/:user_id', Administrator.grantUser);


// manage course
let CourseManager = require('../controller/course_manager');
router.post('/api/course',
            upload.single('icon'),
            CourseManager.createCourse);
router.put('/api/course/:course_id',
           upload.single('icon'),
           CourseManager.updateCourse);
router.delete('/api/course/:course_id', CourseManager.deleteCourse);
router.get('/api/courses', CourseManager.getManagedCourses);
router.delete('/api/course/:course_id/lecture/:lecture_id',
              CourseManager.deleteLecture);
router.delete('/api/course/:course_id/file/:file_id',
              CourseManager.deleteFile);

// upload files
let uploader = require('../controller/upload');
router.post('/api/:course_id/lecture',
            upload.single('lecture'),
            uploader.uploadLecture);
router.post('/api/:course_id/file',
            upload.single('file'),
            uploader.uploadFile);


// learner api
let CourseLearner = require('../controller/course_learner');
router.get('/api/allcourses', CourseLearner.getAllCourses);
router.get('/api/allcourses/:categories', CourseLearner.getAllCoursesOfCats);
router.get('/api/takecourse/:course_id', CourseLearner.takeCourse);
router.get('/api/takencourses', CourseLearner.takenCourses);
router.get('/api/takencourses/:course_id', CourseLearner.getTakenCourse);



router.get('/test', function(req, res) {
    let session = req.session;
    if (session.views) {
        session.views++;
    } else {
        session.views = 1;
    }

    res.status(200);
    res.json({view: session.views});
});

module.exports = router;
