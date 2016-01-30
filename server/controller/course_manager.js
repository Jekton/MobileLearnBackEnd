'use strict';

let mongoose = require('mongoose');
let UserCapability = require('../model/capability').UserCapability;
let myUtils = require('../common/utils');
let sendJsonMessage = myUtils.sendJsonMessage;
let sendJsonResponse = myUtils.sendJsonResponse;
let checkLogin = require('../common/permission').checkLogin;
let Course = require('../model/course');

exports.createCourse = function(req, res) {
    if (!checkLogin(req, res)) {
        return;
    }

    let user = req.session.user;
    if (!(user.capability & UserCapability.CAP_CREATE_COURSE)) {
        sendJsonMessage(res, 401, 'Permission deny');
        return;
    }

    if (!req.body.name || !req.body.categories) {
        sendJsonMessage(res, 400 , 'All field required');
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
        sendJsonMessage(res, 400, 'invalid categories');
        return;
    }

    let course = Course.makeCourse(req.body.name,
                                   req.body.desc ? req.body.desc : '',
                                   cats,
                                   user.id);
    course.save(function(err, course) {
        if (err) {
            sendJsonResponse(res, 400, {
                message: 'fail to create course',
                error: err
            });
        } else {
            sendJsonResponse(res, 200, course);
        }
    });
    
};
