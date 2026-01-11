const multer = require("multer");
const path = require("path");
const fs = require("fs");

module.exports = function uploadImage(folderType, fieldName = "image") {
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
        default:
          cb(new Error("Invalid field name"), null);
      }

      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    },
  });

  const limits = {
    fileSize: 5 * 1024 * 1024, // 5 MB
  };

  return multer({
    storage,
    limits,
  }).single(fieldName);
};
