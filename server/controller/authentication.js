'use strict';

let passport = require('passport');
let mongoose = require('mongoose');
let User = mongoose.model('User');
let sendJsonResponse = require('../common/utils').sendJsonResponse;


module.exports.login = function(req, res) {
    if (!req.body.email || !req.body.password) {
        sendJsonResponse(res, 400, {
            'message': 'All fieldss required'
        });
        return;       
    }

    passport.authenticate('local', function(err, user, info) {
        if (err) {
            sendJsonResponse(res, 404, err);
            return;
        }

        if (user) {
            var token = user.generateJwt();
            sendJsonResponse(res, 200, {
                token: token
            });
        } else {
            sendJsonResponse(res, 401, info);
        }
    })(req, res);
};
