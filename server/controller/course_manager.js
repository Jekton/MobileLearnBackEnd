'use strict';

let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let permission = require('../utils/permission');
let CourseUtil = require('../utils/course');
let CourseCategoryUtil = require('../utils/course-category');
let saveCourse = CourseUtil.saveCourse;
let Course = mongoose.model('Course');
let User = mongoose.model('User');


function processRawCategories(res, categories) {
    console.log('processRawCategories');
    let cats = [];
    categories.split(',').forEach(function(n) {
        let cat = Number.parseInt(n);
        if (!Number.isNaN(cat)
            && CourseCategoryUtil.isCategoryValid(cat)) {
            cats.push(cat);
        }
    });

    if (cats.length === 0) {
        myUtils.sendJsonMessage(res, 400, 'invalid categories');
        return null;
    }
    console.log('processRawCategories' + cats);
    return cats;
}


exports.createCourse = function(req, res) {
    let user = req.session.user;
    console.log('enter create course');
    if (!permission.checkCourseCreatorCap(user, res)) {
        return;
    };
    console.log('oo');
    if (!req.body.name || !req.body.categories) {
        myUtils.sendJsonMessage(res, 400 , 'All field required');
        return;
    }
    console.log('oo');
    let cats = processRawCategories(res, req.body.categories);
    if (cats === null) {
        return;
    }

    console.log('creating course');
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
