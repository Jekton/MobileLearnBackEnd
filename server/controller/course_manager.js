'use strict';

let mongoose = require('mongoose');
let UserCapability = require('../model/capability').UserCapability;
let myUtils = require('../common/utils');
let checkLogin = require('../common/permission').checkLogin;
let Course = require('../model/course');
let User = mongoose.model('User');

exports.createCourse = function(req, res) {
    if (!checkLogin(req, res)) {
        return;
    }

    let user = req.session.user;
    if (!(user.capability & UserCapability.CAP_ADMIN)
        && !(user.capability & UserCapability.CAP_CREATE_COURSE)) {
        myUtils.sendJsonMessage(res, 401, 'Permission deny');
        return;
    }

    if (!req.body.name || !req.body.categories) {
        myUtils.sendJsonMessage(res, 400 , 'All field required');
        return;
    }

    let cats = [];
    req.body.categories.split(',').forEach(function(n) {
        let cat = Number.parseInt(n);
        if (!Number.isNaN(cat) && Course.isCategoryValid(cat)) {
            cats.push(cat);
        }
    });

    if (cats.length === 0) {
        myUtils.sendJsonMessage(res, 400, 'invalid categories');
        return;
    }

    let course = Course.makeCourse(req.body.name,
                                   req.body.desc ? req.body.desc : '',
                                   cats,
                                   user.email);
    course.save(function(err, course) {
        if (err) {
            myUtils.sendJsonResponse(res, 400, {
                message: 'fail to create course',
                error: err
            });
            return;
        }
        console.log('%j', course);
        User.findById(user.id)
            .select('managedCourses')
            .exec(function(err, user) {
                if (err) {
                    myUtils.sendJsonResponse(res, 400, {
                        message: 'fail to create course',
                        error: err
                    });
                } else {
                    user.managedCourses.push(course);
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


exports.getManagedCourses = function(req, res) {
    if (!checkLogin(req, res)) {
        return;
    }

    User.findById(req.session.user.id)
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
