'use strict';
let mongoose = require('mongoose');

let CourseCategory = {
    get CAT_COMPUTER_SCIENCE() {
        return 0;
    }
}
module.exports.CourseCategory = CourseCategory;

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


module.exports.cat2string = function(cat) {
    switch (cat) {
    case CourseCategory.CAT_COMPUTER_SCIENCE:
        return 'Computer Science';
    default:
        return '';
    }
};
