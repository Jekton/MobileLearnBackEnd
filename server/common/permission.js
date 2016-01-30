'use strict';

let UserCapability = require('../model/capability').UserCapability;
let sendJsonMessage = require('./utils').sendJsonMessage;

exports.checkLogin = function(req, res) {
    let user = req.session.user;
    if (!user) {
        sendJsonMessage(res, 401,
                        'You must login to access this resource');
        return false;
    }

    return true;
};


exports.checkAdminCapability = function(req, res) {
    if (!exports.checkLogin(req, res)) {
        return false;
    }    
    if (!(req.session.user.capability & UserCapability.CAP_ADMIN)) {
        sendJsonMessage(res, 401, 'Permission deny');
        return false;
    }

    return true;
};
