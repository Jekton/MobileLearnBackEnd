'use strict';
let mongoose = require('mongoose');
let myUtils = require('../common/utils');
let sendJsonMessage = myUtils.sendJsonMessage;

let CourseCategory = {
    get CAT_COMPUTER_SCIENCE() {
        return 0;
    },

    get NR_CAT_MAX() {
        return 1;
    }
};
exports.CourseCategory = CourseCategory;
exports.isCategoryValid = function(cat) {
    return cat < CourseCategory.NR_CAT_MAX;
};

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
    lectures: {
        path: String
    },
    watchTo: [Number],
    publish: {
        type: Boolean,
        "default": false
    }
});

module.exports.courseSchema = courseSchema;
mongoose.model('Course', courseSchema, 'courses');


module.exports.cat2string = function(cat) {
    switch (cat) {
    case CourseCategory.CAT_COMPUTER_SCIENCE:
        return 'Computer Science';
    default:
        return '';
    }
};

let Course = mongoose.model('Course');
module.exports.makeCourse = function(name, desc, categories, email) {
    let course = new Course();
    course.name = name;
    course.desc = desc;
    course.categories = categories;
    course.createdBy = email;
    course.managedBy.push(email);
    course.lectureNum = 0;

    return course;
};
