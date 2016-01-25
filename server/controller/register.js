'use strict';

let passport = require('passport');
let mongoose = require('mongoose');
let User = mongoose.model('User');
let sendJsonResponse = require('../common/utils').sendJsonResponse;

function regExpValidate(reg, string) {
    return reg.test(string);
}

function validateName(name) {
    // setting just user like
    return true;
}

function validateEmail(email) {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regExpValidate(reg, email);
}

function validatePassword(password) {
    const reg = /^[a-zA-Z0-9!@#$%^&*_-]{6,16}$/;
    return regExpValidate(reg, password);
}


function validateRegisterInfo(name, email, password) {
    return validateName(name)
        && validateEmail(email)
        && validatePassword(password);
}

module.exports = function(req, res) {
    console.log('registering');

    if (!validateRegisterInfo(req.body.name, req.body.email, req.body.password)) {
        sendJsonResponse(res, 400, {
            'message': 'invalid register info'
        });
        return;
    }
        
    var user = new User();

    user.name = req.body.name;
    user.email = req.body.email;
    user.setPassword(req.body.password);

    user.save(function(err) {
        if (err) {
            sendJsonResponse(res, 404, err);
        } else {
            var token = user.generateJwt();
            sendJsonResponse(res, 200, {
                token: token
            });
        }
    });
};
