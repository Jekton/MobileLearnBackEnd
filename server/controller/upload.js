'use strict';

let fs = require('fs');
let permission = require('../utils/permission');
let myUtils = require('../utils/utils');
let CourseUtil = require('../utils/course');
let saveCourse = CourseUtil.saveCourse;
let mongoose = require('mongoose');
let Course = mongoose.model('Course');


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
            console.log('course found');
            let toBeAdded = {
                filename: file.originalname,
                path: '/uploads/' + file.filename
            };
            console.log('coures: %j', course);
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
    console.log('in addLecture');
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
            fs.unlink(req.file.path, function(err) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('unlinked unauthorized uploaded file');
                }
            });
        } else {
            console.log('going to add');
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
