'use strict';

let passport = require('passport');
let mongoose = require('mongoose');
let makeUser = require('../model/user').makeUser;
let sendJsonResponse = require('../utils/utils').sendJsonResponse;

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

    if (!validateRegisterInfo(req.body.name,
                              req.body.email,
                              req.body.password)) {
        sendJsonResponse(res, 400, {
            'message': 'invalid register info'
        });
        return;
    }
            
    let user = makeUser(req.body.name,
                        req.body.email,
                        req.body.password);
    console.log(user);
    user.save(function(err) {
        if (err) {
            sendJsonResponse(res, 404, {
                message: 'register fail',
                error: err
            });
        } else {
            sendJsonResponse(res, 200, {
                message: 'register success'
            });
        }
    });
};
