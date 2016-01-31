'use strict';
let mongoose = require('mongoose');
let User = mongoose.model('User');
let Course = mongoose.model('Course');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;

exports.saveCourse = function (res, course, userId, updater) {
    course.save(function(err, course) {
        if (err) {
            myUtils.sendJsonResponse(res, 400, {
                message: 'fail to create course',
                error: err
            });
            return;
        }
        console.log('%j', course);
        User.findById(userId)
            .select('managedCourses')
            .exec(function(err, user) {
                if (err) {
                    myUtils.sendJsonResponse(res, 400, {
                        message: 'fail to create course',
                        error: err
                    });
                } else {
                    updater(user, course);
                    user.save(function(err) {
                        if (err) {
                            myUtils.sendJsonResponse(res, 400, {
                                message: 'fail to save course',
                                error: err
                            });
                        } else {
                            myUtils.sendJsonResponse(res, 200, course);
                        }
                    });
                }
            });  
    });
};

exports.makeCourse = function(name, desc, categories, email) {
    let course = new Course();
    course.name = name;
    course.desc = desc;
    course.categories = categories;
    course.createdBy = email;
    course.managedBy.push(email);
    course.lectureNum = 0;

    return course;
};
