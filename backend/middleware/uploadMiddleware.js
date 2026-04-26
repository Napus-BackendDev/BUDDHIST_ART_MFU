const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = function uploadImage(folderType, fieldName = "image", isMultiple = false, maxFiles = 10) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      let folderPath;

      switch (folderType) {
        case "artwork":
          folderPath = path.join(__dirname, "../public/data/uploads/artwork/");
          break;
        case "profile":
          folderPath = path.join(__dirname, "../public/data/uploads/profile/");
          break;
        case "news":
          folderPath = path.join(__dirname, "../public/data/uploads/news/");
          break;
        case "order":
          folderPath = path.join(__dirname, "../public/data/uploads/order/");
          break;
        case "submission":
          folderPath = path.join(__dirname, "../public/data/uploads/submission/");
          break;
        default:
          return cb(new Error("Invalid field name"), null);
      }
      
      if (folderPath) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      cb(null, folderPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, folderType + "-" + uniqueSuffix + ext);
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  };

  const limits = {
    fileSize: 5 * 1024 * 1024, // 5 MB
  };

  return isMultiple 
    ? multer({ storage, fileFilter, limits }).array(fieldName, maxFiles)
    : multer({ storage, fileFilter, limits }).single(fieldName);
};
