
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
