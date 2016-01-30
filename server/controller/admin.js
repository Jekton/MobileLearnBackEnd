'use strict';

let mongoose = require('mongoose');
let User = mongoose.model('User');
let myUtils = require('../common/utils');
let sendJsonResponse = myUtils.sendJsonResponse;
let sendJsonMessage = myUtils.sendJsonMessage;
let capability = require('../model/capability');
let UserCapability = capability.UserCapability;
let permission = require('../common/permission');



exports.getUsers = function(req, res) {
    if (!permission.checkAdminCapability(req, res)) {
        return;
    }
    
    let user = req.session.user;

    User.find({}, function(err, users) {
        var userMap = {};

        users.forEach(function(user) {
            user.managedCourses = undefined;
            user.takenCourses = undefined;
            user.hash = undefined;
            user.salt = undefined;
            userMap[user._id] = user;
            userMap[user._id]._id = undefined;
        });

        sendJsonResponse(res, 200, userMap);
    });
};





exports.grantUser = function(req, res) {
    if (!permission.checkAdminCapability(req, res)) {
        return;
    }
    
    let userId = req.body.user_id;
    let cap = req.body.cap;

    if (!userId || !cap) {
        sendJsonMessage(res, 400, "All field required");
        return;
    }

    if (!capability.isUserCapabilityValid(cap)) {
        sendJsonMessage(res, 400, "Invalid capability");
        return;
    }

    let user = User.findById(userId)
        .select('capability')
        .exec(function(err, user) {
            if (err) {
                sendJsonMessage(res, 500,
                                'fail to update user capability');
            } else {
                user.capability |= cap;
                user.save(function(err) {
                    if (err) {
                        sendJsonMessage(res, 500,
                                        'fail to update user capability');
                    } else {
                        sendJsonMessage(res, 200, 'update success');
                    }
                });
            }
        });
};
