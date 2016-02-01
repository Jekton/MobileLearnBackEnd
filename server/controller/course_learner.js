'use strict';

let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;
let sendJsonResponse = myUtils.sendJsonResponse;
let Course = mongoose.model('Course');

exports.getAllCourses = function(req, res) {
    Course
        .find({}, function(err, courses) {
            if (err) {
                sendJsonResponse(res, 404, {
                    message: 'Course not found',
                    error: err
                });
            } else {
                sendJsonResponse(res, 200, courses);
            }
        });
};
