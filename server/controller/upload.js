'use strict';

let permission = require('../utils/permission');
let myUtils = require('../utils/utils');
let CourseUtil = require('../utils/course');
let saveCourse = CourseUtil.saveCourse;
let mongoose = require('mongoose');
let Course = mongoose.model('Course');
let Path = mongoose.model('Path');
const crypto = require('crypto');


function doAdd(res, courseId, userId, file, updater) {
    Course
        .findById(courseId)
        .exec(function(err, course) {
            if (err) {
                myUtils.sendJsonResponse(res, 400, {
                     message: 'fail to create course',
                     error: err
                 });
                // Note: dose not unroll the saved file
                return;
            }
            
            let toBeAdded = new Path();
            toBeAdded.filename = file.originalname;
            toBeAdded.path = '/uploads/' + file.filename;

            updater(course, toBeAdded);
            saveCourse(res, course, userId, function(user, course) {
                let courses = user.managedCourses;
                for (let i = 0; i < courses.length; ++i) {
                    if (courses[i].id === course.id) {
                        updater(courses[i], toBeAdded);
                        break;
                    }
                }
            });
        });
}

function addLecture(res, courseId, userId, file) {
    doAdd(res, courseId, userId, file, function(course, toBeAdded) {
        course.lectures.push(toBeAdded);
        course.lectureNum++;        
    });
}

function addFile(res, courseId, userId, file) {
    doAdd(res, courseId, userId, file, function(course, toBeAdded) {
        course.files.push(toBeAdded);
    });
}

function makeUploadHandler(permissionChecker, adder) {
    function handler(req, res, next) {
        let user = req.session.user;
        if (!permissionChecker(user, res)) {
            myUtils.deleteFile(req.file.path);
        } else {
            if (!req.file) {
                myUtils.sendJsonMessage(res, 400, 'not file uploaded');
                return;
            }
            
            adder(res,
                  req.params.course_id,
                  user.id,
                  req.file);
        }
    }

    return handler;
}

exports.uploadLecture
    = makeUploadHandler(permission.checkLectureUploadCap,
                        addLecture);

exports.uploadFile
    = makeUploadHandler(permission.checkFileUploadCap,
                        addFile);
