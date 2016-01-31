'use strict';

let mongoose = require('mongoose');
let UserCapability = require('../model/capability').UserCapability;
let myUtils = require('../common/utils');
let permission = require('../common/permission');
let CourseUtil = require('../model/course');
let Course = mongoose.model('Course');
let User = mongoose.model('User');

function saveCourse(res, course, userId, updater) {
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
}

function processRawCategories(res, categories) {
    let cats = [];
    categories.split(',').forEach(function(n) {
        let cat = Number.parseInt(n);
        if (!Number.isNaN(cat) && CourseUtil.isCategoryValid(cat)) {
            cats.push(cat);
        }
    });

    if (cats.length === 0) {
        myUtils.sendJsonMessage(res, 400, 'invalid categories');
        return null;
    }
    return cats;
}


exports.createCourse = function(req, res) {
    let user = req.session.user;

    if (!permission.checkCourseCreatorCap(user, res)) {
        return;
    };

    if (!req.body.name || !req.body.categories) {
        myUtils.sendJsonMessage(res, 400 , 'All field required');
        return;
    }

    let cats = processRawCategories(res, req.body.categories);
    if (cats === null) {
        return;
    }

    let course = CourseUtil.makeCourse(req.body.name,
                                   req.body.desc ? req.body.desc : '',
                                   cats,
                                   user.email);
    saveCourse(res, course, user.id, function(user, course) {
        user.managedCourses.push(course);
    });
};


exports.updateCourse = function(req, res) {
    let user = req.session.user;

    if (!permission.checkLogin(user, res)) {
        return;
    }

    if (!req.body.name || !req.body.categories || !req.body.desc) {
        myUtils.sendJsonMessage(res, 400 , 'All field required');
        return;
    }

    let cats = processRawCategories(res, req.body.categories);
    if (cats === null) {
        return;
    }

    let publish = Number.parseInt(req.body.publish) ? true : false;

    Course
        .findById(req.params.course_id)
        .exec(function(err, course) {
            if (err) {
                myUtils.sendJsonMessage(res, 400, 'invalid course id');
                return;
            }

            if (course.managedBy.indexOf(user.email) < 0) {
                myUtils.sendJsonMessage(res, 401, 'Permission deny');
                return;
            }

            course.name = req.body.name;
            course.categories = cats;
            course.desc = req.body.desc;
            course.publish = publish;
            saveCourse(res, course, user.id, function(user, course) {
                let courses = user.managedCourses;
                for (let i = 0; i < courses.length; ++i) {
                    if (courses[i].id === course.id) {
                        console.log('find couse of managedCourses');
                        courses[i].name = course.name;
                        courses[i].categories = course.categories;
                        courses[i].desc = course.desc;
                        courses[i].publish = course.publish;
                        break;
                    }
                }
            });
        });
};


exports.getManagedCourses = function(req, res) {
    let user = req.session.user;
    if (!permission.checkLogin(user, res)) {
        return;
    }

    User.findById(user.id)
        .select('managedCourses')
        .exec(function(err, user) {
            if (err) {
                myUtils.sendJsonResponse(res, 400, {
                    message: 'fail to create course',
                    error: err
                });
            } else {
                myUtils.sendJsonResponse(res, 200, user.managedCourses);
            }
        });

};
