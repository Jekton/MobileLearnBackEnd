'use strict';

let express = require('express');
let router = express.Router();

let multer  = require('multer');
let storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

let upload = multer({ storage: storage });

let uploader = require('../controller/upload');
router.post('/api/:course_id/lecture',
            upload.single('lecture'),
            uploader.uploadLecture);


module.exports = router;
