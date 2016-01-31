'use strict';

let UserCapability = require('../model/capability').UserCapability;
let sendJsonMessage = require('./utils').sendJsonMessage;

exports.checkLogin = function(user, res) {
    if (!user) {
        sendJsonMessage(res, 401,
                        'You must login to access this resource');
        return false;
    }

    return true;
};


function makeChecker(cap, cap2) {
    function check(user, res) {
        if (!exports.checkLogin(user, res)) {
            return false;
        }
        cap2 = cap2 || cap;
        if (!(user.capability & cap)
            && !(user.capability & cap2)) {
            sendJsonMessage(res, 401, 'Permission deny');
            return false;
        }
        return true;
    }
    return check;
}

exports.checkAdminCapability
    = makeChecker(UserCapability.CAP_ADMIN);

exports.checkCourseCreatorCap
    = makeChecker(UserCapability.CAP_ADMIN,
                  UserCapability.CAP_CREATE_COURSE);

exports.checkLectureUploadCap
    = makeChecker(UserCapability.CAP_ADMIN,
                  UserCapability.CAP_UPLOAD_LECTURE);

exports.checkFileUploadCap
    = makeChecker(UserCapability.CAP_ADMIN,
                  UserCapability.CAP_UPLOAD_FILE);

exports.checkAddReviewCap
    = makeChecker(UserCapability.CAP_ADMIN,
                  UserCapability.CAP_ADD_REVIEW);
