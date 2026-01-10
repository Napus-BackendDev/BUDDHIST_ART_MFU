const multer = require('multer');
const path = require('path');

exports.upload = async (req, res, next) => {
    const storage = multer.diskStorage({});
}