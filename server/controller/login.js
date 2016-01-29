'use strict';

let passport = require('passport');
let mongoose = require('mongoose');
let User = mongoose.model('User');
let sendJsonResponse = require('../common/utils').sendJsonResponse;


function updateUserSession(session, user) {
    session.user = {
        // Store some infomation of user in the server
        email: user.email
    };
}

function onLoginSuccess(req, res, user) {
    updateUserSession(req.session, user);
    sendJsonResponse(res, 200, {
        message: 'login success',
        // send session back for testing
        session: req.session
    });
}

function onLoginError(req, res) {
    sendJsonResponse(res, 404, {
        message: 'login error'
    });
}

function onLoginFail(req, res) {
    if (req.session) {
        req.session.destroy(function(err) {
            if (err) {
                console.error(err);
            }
        });
    }
    sendJsonResponse(res, 401, {
        message: 'login fail, please check your password or email'
    });
}

module.exports.login = function(req, res) {
    if (!req.body.email || !req.body.password) {
        sendJsonResponse(res, 400, {
            'message': 'All fieldss required'
        });
        return;       
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            onLoginFail(req, res);
            return;
        }

        if (user) {
            onLoginSuccess(req, res, user);
        } else {
            onLoginFail(req, res);
        }
    })(req, res);
};
