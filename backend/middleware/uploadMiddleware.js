const multer = require("multer");
const path = require("path");
const fs = require("fs");

/**
 * Middleware for handling image uploads via Multer.
 * 
 * @param {string} folderType - The type of folder to upload to (e.g., 'artwork', 'profile', 'news', 'order', 'submission')
 * @param {string} fieldName - The name of the form field containing the image(s)
 * @param {boolean} isMultiple - Whether to allow multiple file uploads
 * @param {number} maxFiles - Maximum number of files for multiple uploads
 */
module.exports = function uploadImage(folderType, fieldName = "image", isMultiple = false, maxFiles = 10) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // mapping of folder types to relative paths from middleware directory
      const paths = {
        artwork: "../public/data/uploads/artwork/",
        profile: "../public/data/uploads/profile/",
        news: "../public/data/uploads/news/",
        order: "../public/data/uploads/order/",
        submission: "../public/data/uploads/submission/",
      };

      const relativePath = paths[folderType];
      
      if (!relativePath) {
        console.error(`[UploadMiddleware] Invalid folderType: "${folderType}". Check your route definition.`);
        return cb(new Error(`Invalid folder type: ${folderType}`));
      }

      const folderPath = path.join(__dirname, relativePath);

      try {
        // Ensure the directory exists
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
      } catch (err) {
        console.error(`[UploadMiddleware] Error creating directory "${folderPath}":`, err);
        cb(err);
      }
    },
    filename: function (req, file, cb) {
      // Create a unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      const safeFolderType = typeof folderType === 'string' ? folderType : 'upload';
      cb(null, `${safeFolderType}-${uniqueSuffix}${ext}`);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed! (jpeg, jpg, png, gif, webp)"));
  };

  const limits = {
    fileSize: 5 * 1024 * 1024, // 5 MB
  };

  // Return single or array middleware based on isMultiple flag
  const upload = multer({ storage, fileFilter, limits });
  
  return isMultiple 
    ? upload.array(fieldName, maxFiles)
    : upload.single(fieldName);
};
