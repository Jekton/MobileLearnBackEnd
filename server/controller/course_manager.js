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
let getCoursesRelatedToUser = CourseUtil.getCoursesRelatedToUser;

let Course = mongoose.model('Course');
let User = mongoose.model('User');



exports.createCourse = function(req, res) {
    let user = req.session.user;

    if (!permission.checkCourseCreatorCap(user, res)) {
        return;
    };

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
        user.managedCourses.push(course);
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
            saveCourse(res, course, user.id, function(user, course) {
                let courses = user.managedCourses;
                for (let i = 0; i < courses.length; ++i) {
                    if (courses[i].id === course.id) {
                        console.log('find couse of managedCourses');
                        courses[i].name = course.name;
                        courses[i].categories = course.categories;
                        courses[i].desc = course.desc;
                        courses[i].publish = course.publish;
                        break;
                    }
                }
            });
    });
};


exports.getManagedCourses = function(req, res) {
    getCoursesRelatedToUser(req, res, 'managedCourses', function(user) {
        return user.managedCourses;
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
    console.log('enter doDeleteLectureOrFile');

    function removeFileOf(user) {
        let courses = user.managedCourses;
        let i;
        for (i = 0; i < courses.length; ++i) {
            // directly compare these two ids won't success
            if (courses[i]._id.toString() == courseId) {
                console.log('found course of managed by user');
                break;
            }
        }
        if (i === courses.length) return;
        
        let files = typeChooser(courses[i]);
        for (i = 0; i < files.length; ++i) {
            // directly compare these two ids won't success
            if (files[i].id === fileId) {
                console.log('found file of managed by user');
                break;
            }
        }
        if (i === files.length) return;

        files.splice(i, 1);

        user.save(function(err) {
            if (err) {
                console.log('error: %j', err);
            }
        });
    }

    
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
                }
            });

            User.find({}, function(err, users) {
                users.forEach(function(user) {
                    removeFileOf(user);
                });
                
                sendJsonMessage(res, 200, 'file deleted');
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
