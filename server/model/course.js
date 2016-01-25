'use strict';
let mongoose = require('mongoose');

module.exports.CourseCategory = {
    get cat_cs() {
        return 0;
    }
};

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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    managedBy: [mongoose.Schema.Types.ObjectId],
    lectureNum: Number,
    lectures: {
        path: String
    },
    watchTo: [Number]
});


module.exports.courseSchema = courseSchema;

mongoose.model('Course', courseSchema, 'courses');
