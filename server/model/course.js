'use strict';
let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;

let pathSchema = mongoose.Schema({    
        filename: String,
        path: String
});


let courseSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        default: ''
    },
    categories: [Number],
    iconPath: {
        type: String
    },
    createdBy: {
        // creator's email
        type: String,
        required: true
    },
    managedBy: [String],
    lectureNum: Number,
    lectures: [pathSchema],
    files: [pathSchema],
    publish: {
        type: Boolean,
        "default": false
    }
});


exports.courseSchema = courseSchema;
exports.pathSchema = pathSchema;
mongoose.model('Course', courseSchema, 'courses');
mongoose.model('Path', pathSchema, 'pathes');

