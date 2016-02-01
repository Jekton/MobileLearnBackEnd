'use strict';

let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;
let sendJsonResponse = myUtils.sendJsonResponse;
let Course = mongoose.model('Course');
let CourseCategoryUtil = require('../utils/course-category');
let processRawCategories = CourseCategoryUtil.processRawCategories;


function doGetAllCourses(res, filter) {
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
                sendJsonResponse(res, 200, responsedCourses);
            }
        });
};

exports.getAllCourses = function(req, res) {
    doGetAllCourses(res, function(courses) {
        // no-op
        return courses;
    });
};


exports.getAllCoursesOfCats = function(req, res) {
    let cats = processRawCategories(res, req.params.categories);
    if (cats === null) return;
    
    doGetAllCourses(res, function(courses) {
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
