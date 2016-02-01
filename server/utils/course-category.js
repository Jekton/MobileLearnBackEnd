'use strict';

let myUtils = require('./utils');
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


module.exports.cat2string = function(cat) {
    switch (cat) {
    case CourseCategory.CAT_COMPUTER_SCIENCE:
        return 'Computer Science';
    default:
        return '';
    }
};


exports.processRawCategories = function(res, categories) {
    let cats = [];
    categories.split(',').forEach(function(n) {
        let cat = Number.parseInt(n);
        if (!Number.isNaN(cat)
            && exports.isCategoryValid(cat)) {
            cats.push(cat);
        }
    });

    if (cats.length === 0) {
        sendJsonMessage(res, 400, 'invalid categories');
        return null;
    }
    console.log('processRawCategories' + cats);
    return cats;
};

