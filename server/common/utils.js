function sendJsonResponse(res, status, content) {
    res.status(status);
    res.json(content);
}

exports.sendJsonResponse = sendJsonResponse;
