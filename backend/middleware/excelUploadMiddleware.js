const multer = require('multer');
const path = require('path');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 160 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, cb) => {
        const extension = path.extname(file.originalname || '').toLowerCase();
        const allowedMimeTypes = new Set([
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/zip',
            'application/octet-stream'
        ]);
        if (extension === '.xlsx' && allowedMimeTypes.has(file.mimetype)) {
            return cb(null, true);
        }
        return cb(new Error('Only .xlsx workbooks are supported for embedded-image import.'));
    }
});

module.exports = upload.single('workbook');
