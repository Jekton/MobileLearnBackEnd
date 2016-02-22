'use strict';

let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;
let sendJsonResponse = myUtils.sendJsonResponse;
let Course = mongoose.model('Course');
let User = mongoose.model('User');
let CourseCategoryUtil = require('../utils/course-category');
let processRawCategories = CourseCategoryUtil.processRawCategories;
let permission = require('../utils/permission');

let CourseUtil = require('../utils/course');
let getCoursesRelatedToUser = CourseUtil.getCoursesRelatedToUser;

function doGetAllCourses(req, res, filter) {
    function setTakenOrNot(courses, userId) {
        User
            .findById(userId)
            .exec(function(err, user) {
                if (err) {
                    sendJsonMessage(res, 404, 'user not found');
                    return;
                }
                let takenCourses = user.takenCourses;
                for (let i = 0; i < courses.length; ++i) {
                    for (let j = 0; j < takenCourses.length; ++j) {
                        if (courses[i]._id.toString() == takenCourses[j]._id) {
                            courses[i].taken = true;
                        }
                    }
                }

                sendJsonResponse(res, 200, courses);
            });
    }
    
    Course
        .find({}, function(err, courses) {
            if (err) {
                sendJsonResponse(res, 404, {
                    message: 'Course not found',
                    error: err
                });
            } else {
                let published = [];
                courses.forEach(function(course) {
                    if (course.publish) published.push(course);
                });
                
                let responsedCourses = filter(published);

                if (req.session.user) {
                    setTakenOrNot(responsedCourses, req.session.user.id);
                } else {
                    // no login, directly send it back
                    sendJsonResponse(res, 200, responsedCourses);
                }
            }
        });
};

exports.getAllCourses = function(req, res) {
    doGetAllCourses(req, res, function(courses) {
        // no-op
        return courses;
    });
};


exports.getAllCoursesOfCats = function(req, res) {
    let cats = processRawCategories(res, req.params.categories);
    if (cats === null) return;
    
    doGetAllCourses(req, res, function(courses) {
        let result = [];

        courses.forEach(function(course) {
            for (let i = 0; i < cats.length; ++i) {
                if (course.categories.indexOf(cats[i]) >= 0) {
                    result.push(course);
                    break;
                }
            }
        });

        return result;
    });
};


exports.takeCourse = function(req, res) {
    function saveTakenCourse(userId, course) {
        User
            .findById(userId)
            .exec(function(err, user) {
                if (err) {
                    sendJsonMessage(res, 200, 'Invalid user');
                    return;
                }

                let courses = user.takenCourses;
                let taken = false;
                for (let i = 0; i < courses.length; ++i) {
                    if (courses[i]._id.toString() == course._id) {
                        taken = true;
                        break;
                    }
                }

                if (taken) {
                    sendJsonMessage(res, 400, 'already taken');
                    return;
                }

                courses.taken = true;
                courses.push(course);
                user.save(function(err) {
                    if (err) {
                        sendJsonMessage(res, 400, 'fail to join this course');
                    } else {
                        sendJsonMessage(res, 200, 'course taken');
                    }
                });
            });
    }
    
    
    let user = req.session.user;
    if (!permission.checkLogin(user, res)) {
        return;
    }

    Course
        .findById(req.params.course_id)
        .exec(function(err, course) {
            if (err || !course.publish) {
                sendJsonMessage(res, 200, 'Course not found');
                return;
            }

            saveTakenCourse(user.id, course);
        });
};


exports.takenCourses = function(req, res) {
    getCoursesRelatedToUser(req, res, 'takenCourses', function(user) {
        return user.takenCourses;
    });
};


exports.getTakenCourse = function(req, res) {
    console.log(req.params.course_id);
    getCoursesRelatedToUser(req, res, 'takenCourses', function(user) {
        let result = null;
        user.takenCourses.forEach(function(course) {
            if (course._id.toString() == req.params.course_id) {
                result = course;
            }
        });
        return result;
    });
};
