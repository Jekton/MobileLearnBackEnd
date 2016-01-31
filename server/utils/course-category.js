'use strict';

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


module.exports.cat2string = function(cat) {
    switch (cat) {
    case CourseCategory.CAT_COMPUTER_SCIENCE:
        return 'Computer Science';
    default:
        return '';
    }
};




