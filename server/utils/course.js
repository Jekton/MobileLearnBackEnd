'use strict';
let mongoose = require('mongoose');
let User = mongoose.model('User');
let Course = mongoose.model('Course');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;
let sendJsonResponse = myUtils.sendJsonResponse;
let permission = require('../utils/permission');

exports.saveCourse = function (res, course, userId, updater) {
    course.save(function(err, course) {
        if (err) {
            myUtils.sendJsonResponse(res, 400, {
                message: 'fail to create course',
                error: err
            });
            return;
        }
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

exports.makeCourse = function(name, desc, categories, iconFile, email) {
    let course = new Course();
    course.name = name;
    course.desc = desc;
    course.categories = categories;
    course.iconPath = '/uploads/' + iconFile.filename;
    course.createdBy = email;
    course.managedBy.push(email);
    course.lectureNum = 0;

    return course;
};



exports.removeCourse = function(res, courseId) {
    function removeCourseOf(user) {
        let courses = user.managedCourses;
        let i;
        for (i = 0; i < courses.length; ++i) {
            // directly compare these two ids won't success
            if (courses[i]._id.toString() == courseId) {
                break;
            }
        }
        // delete the course
        courses.splice(i, 1);

        user.save(function(err) {
            if (err) {
                console.log('error: %j', err);
            }
        });
    }

    
    Course
        .findById(courseId)
        .remove(function(err) {
            if (err) {
                sendJsonMessage(res, 500, 'delete course fail');
                return;
            }
            console.log('course deleted');

            User.find({}, function(err, users) {
                users.forEach(function(user) {
                    removeCourseOf(user);
                });
                
                sendJsonMessage(res, 200, 'Course deleted');
            });
        });
};



exports.getCoursesRelatedToUser = function(req,
                                           res,
                                           whichType,
                                           chooser) {
    let user = req.session.user;
    if (!permission.checkLogin(user, res)) {
        return;
    }

    User.findById(user.id)
        .select(whichType)
        .exec(function(err, user) {
            if (err) {
                sendJsonResponse(res, 400, {
                    message: 'fail to get courses',
                    error: err
                });
            } else {
                let courses = chooser(user);
                if (courses == null) {
                    sendJsonMessage(res, 404, 'Course not found');
                } else {
                    sendJsonResponse(res, 200, courses);
                }
            }
        });
};

exports.getUser = function (req, res, operator) {
    let user = req.session.user;
    if (!permission.checkLogin(user, res)) {
        return;
    }

    User.findById(user.id)
        .exec(function(err, user) {
                  if (err) {
                      sendJsonResponse(res, 400, {
                          message: 'fail to get courses',
                          error: err
                      });
                  } else {
                      operator(user);
                  }
              });
};
