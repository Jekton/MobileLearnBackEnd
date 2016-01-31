'use strict';

let fs = require('fs');
let permission = require('../utils/permission');
let myUtils = require('../utils/utils');
let CourseUtil = require('../utils/course');
let saveCourse = CourseUtil.saveCourse;
let mongoose = require('mongoose');
let Course = mongoose.model('Course');

function addLecture(res, courseId, userId, file) {
    console.log('in addLecture');
    Course
        .findById(courseId)
        .select('lectures lectureNum')
        .exec(function(err, course) {
            if (err) {
                myUtils.sendJsonResponse(res, 400, {
                     message: 'fail to create course',
                     error: err
                 });
                // Note: dose not unroll the saved file
                return;
            }

            let lecture = {
                filename: file.originalname,
                path: '/ploads/' + file.filename
            };
            console.log('coures: %j', course);
            
            course.lectures.push(lecture);
            course.lectureNum++;
            saveCourse(res, course, userId, function(user, course) {
                let courses = user.managedCourses;
                for (let i = 0; i < courses.length; ++i) {
                    if (courses[i].id === course.id) {
                        courses[i].lectures.push(lecture);
                        courses[i].lectureNum++;
                        break;
                    }
                }
            });
        });
}

exports.uploadLecture = function(req, res, next) {
    let user = req.session.user;
    if (!permission.checkLectureUploadCap(user, res)) {
        fs.unlink(req.file.path, function(err) {
            if (err) {
                console.log(err);
            } else {
                console.log('unlinked unauthorized uploaded lecture');
            }
        });
    } else {        
        addLecture(res,
                   req.params.course_id,
                   user.id,
                   req.file);
    }
}; 
