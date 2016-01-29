'use strict';
let mongoose = require('mongoose');
let crypto = require('crypto');
let course = require('./course');

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
    managedCourses: [course.courseSchema],
    takenCourses: [course.courseSchema]
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
module.exports = userSchema;
