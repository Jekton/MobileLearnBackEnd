'use strict';

let mongoose = require('mongoose');
let myUtils = require('../utils/utils');
let sendJsonMessage = myUtils.sendJsonMessage;
let sendJsonResponse = myUtils.sendJsonResponse;
let permission = require('../utils/permission');
let CourseCategoryUtil = require('../utils/course-category');
let processRawCategories = CourseCategoryUtil.processRawCategories;

let CourseUtil = require('../utils/course');
let saveCourse = CourseUtil.saveCourse;
let removeCourse = CourseUtil.removeCourse;
let getUser = CourseUtil.getUser;
let getCoursesRelatedToUser = CourseUtil.getCoursesRelatedToUser;

let Course = mongoose.model('Course');
let User = mongoose.model('User');



exports.createCourse = function(req, res) {
    let user = req.session.user;

    if (!permission.checkCourseCreatorCap(user, res)) {
        return;
    }

    if (!req.body.name || !req.body.categories || !req.file) {
        sendJsonMessage(res, 400 , 'All field required');
        return;
    }

    let cats = processRawCategories(res, req.body.categories);
    if (cats === null) {
        return;
    }

    let course = CourseUtil.makeCourse(req.body.name,
                                       req.body.desc ? req.body.desc : '',
                                       cats,
                                       req.file,
                                       user.email);
    saveCourse(res, course, user.id, function(user, course) {
        user.managedCourses.push(course._id.toString());
    });
};


function courseManager(res, courseId, user, manager) {
    console.log('enter courseManager');
    Course
        .findById(courseId)
        .exec(function(err, course) {
            if (err) {
                sendJsonMessage(res, 400, 'invalid course id');
                return;
            }

            if (course.managedBy.indexOf(user.email) < 0) {
                sendJsonMessage(res, 401, 'Permission deny');
                return;
            }

            manager(course);
        });
}


exports.updateCourse = function(req, res) {
    let user = req.session.user;

    if (!permission.checkLogin(user, res)) {
        return;
    }

    if (!req.body.name || !req.body.categories || !req.body.desc) {
        sendJsonMessage(res, 400 , 'All field required');
        return;
    }

    let cats = processRawCategories(res, req.body.categories);
    if (cats === null) {
        return;
    }

    let publish = Number.parseInt(req.body.publish) ? true : false;

    courseManager(res, req.params.course_id, user, function(course) {
        course.name = req.body.name;
        course.categories = cats;
        course.desc = req.body.desc;
        course.publish = publish;
        if (req.file) {
            myUtils.deleteFile('./public' + course.iconPath);
            course.iconPath = '/uploads/' + req.file.filename;
        }
        saveCourse(res, course, user.id, function(user, course) {
            // no-op
        });
    });
};


exports.getManagedCourses = function(req, res) {
    getUser(req, res, function(user) {
        Course.find({}, function (err, courses) {
            if (err) {
                sendJsonResponse(res, 404, {
                    message: 'Course not found',
                    error: err
                });
            } else {
                let managedCourses = [];
                courses.forEach(function(course) {
                    for (let i = 0; i < user.managedCourses.length; ++i) {
                        if (user.managedCourses[i] == course._id) {
                            managedCourses.push(course);
                        }
                    }
                });
                sendJsonResponse(res, 200, managedCourses);
            }
        });
    });
};


exports.deleteCourse = function(req, res) {
    function removeLecturesAndFiles(course) {
        myUtils.deleteFile('./public' + course.iconPath);
        course.lectures.forEach(
            lecture => myUtils.deleteFile('./public' + lecture.path));
        course.files.forEach(
            file => myUtils.deleteFile('./public' + file.path));
    }


    let user = req.session.user;
    if (!permission.checkLogin(user, res)) {
        return;
    }
    
    Course
        .findById(req.params.course_id)
        .exec(function(err, course) {
            if (err) {
                sendJsonMessage(res, 400, 'invalid course id');
                return;
            }

            if (course.createdBy !== user.email) {
                sendJsonMessage(res, 401, 'Permission deny');
                return;
            }

            removeLecturesAndFiles(course);
            removeCourse(res, course._id);
        });
};



function doDeleteLectureOrFile(res,
                               user,
                               courseId,
                               fileId,
                               typeChooser) {
    
    if (!permission.checkLogin(user, res)) {
        return;
    }
    
    courseManager(res, courseId, user, function(course) {
        console.log('in courseManager');
        let files = typeChooser(course);
        let i;
        for (i = 0; i < files.length; ++i) {
            console.log(files[i]._id);
            console.log(fileId);
            console.log();
            if (files[i]._id.toString() == fileId) break;
        }
        console.log(`i = ${i}, files.length = ${files.length}`);
        if (i != files.length) {
            myUtils.deleteFile('./public' + files[i].path);
            files.splice(i, 1);
            course.save(function(err) {
                if (err) {
                    console.error('error: %j', err);
                    sendJsonMessage(res, 500, 'server error');
                } else {
                    sendJsonMessage(res, 200, 'file deleted');
                }
            });
        } else {
            sendJsonMessage(res, 400, 'file not found');
        }
    });

}

exports.deleteLecture = function(req, res) {
    console.log('in deleteLecture');
    doDeleteLectureOrFile(res,
                          req.session.user,
                          req.params.course_id,
                          req.params.lecture_id,
                          function(course) {
                              return course.lectures;
                          });
};


exports.deleteFile = function(req, res) {
    doDeleteLectureOrFile(res,
                          req.session.user,
                          req.params.course_id,
                          req.params.file_id,
                          function(course) {
                              return course.files;
                          });
};
