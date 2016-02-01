'use strict';

let fs = require('fs');

function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}
exports.sendJsonResponse = sendJsonResponse;

exports.sendJsonMessage = function(res, status, message) {
    sendJsonResponse(res, status, {
        message: message
    });
};


exports.deleteFile = function(path) {
    fs.unlink(path, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log('unlinked file');
        }
    });
};
