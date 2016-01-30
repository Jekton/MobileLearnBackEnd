'use strict';

let mongoose = require('mongoose');
let User = mongoose.model('User');
let sendJsonResponse = require('../common/utils').sendJsonResponse;
let UserCapability = require('../model/capability').UserCapability;

exports.getUsers = function(req, res) {
    let user = req.session.user;
    if (!user) {
        sendJsonResponse(res, 401, {
            message: 'You must login to access this resource'
        });
        return;
    }

    if (user.capability & UserCapability.CAP_ADMIN) {
        User.find({}, function(err, users) {
            var userMap = {};

            users.forEach(function(user) {
                user.managedCourses = undefined;
                user.takenCourses = undefined;
                user.hash = undefined;
                user.salt = undefined;
                userMap[user._id] = user;
            });

            sendJsonResponse(res, 200, userMap);
        });
    } else {
        sendJsonResponse(res, 401, {
            message: 'Permission deny'
        });
    }
};
