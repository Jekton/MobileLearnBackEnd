'use strict';
let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;

let courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    desc: {
        type: String,
        default: ''
    },
    categories: [Number],
    createdBy: {
        // creator's email
        type: String,
        required: true
    },
    managedBy: [String],
    lectureNum: Number,
    lectures: [{
        filename: String,
        path: String
    }],
    files: [{
        filename: String,
        path: String
    }],
    publish: {
        type: Boolean,
        "default": false
    }
});


module.exports.courseSchema = courseSchema;
mongoose.model('Course', courseSchema, 'courses');

