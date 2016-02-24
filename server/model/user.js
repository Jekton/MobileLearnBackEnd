'use strict';
let mongoose = require('mongoose');
let crypto = require('crypto');
let course = require('./course');
let UserCapability = require('../model/capability').UserCapability;

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        require: true
    },
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,
    capability: Number,
    managedCourses: [String],  // just store course id
    takenCourses: [String]
});


userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};


userSchema.methods.validPassword = function(password) {
    let hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
    return this.hash === hash;
};


mongoose.model('User', userSchema, 'users');
module.exports.userSchema = userSchema;

let User = mongoose.model('User');
module.exports.makeUser = function(name, email, password) {
    let user = new User();

    user.name = name;
    user.email = email;
    user.setPassword(password);
    user.capability = UserCapability.CAP_UPLOAD_FILE
        | UserCapability.CAP_ADD_REVIEW;
    
    return user;
};
