const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

module.exports = function uploadImage(folderType, fieldName = "image", isMultiple = false, maxFiles = 10) {
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Helper function to sanitize text for folders
      const sanitize = (text) => {
        if (!text) return "";
        // Handle array of {key, value} if it's a multi-lang field
        let value = text;
        if (Array.isArray(text)) {
          const enVal = text.find(t => t.key === 'en')?.value;
          const thVal = text.find(t => t.key === 'th')?.value;
          value = enVal || thVal || text[0]?.value || "";
        }
        return String(value).trim().replace(/\s+/g, "_").replace(/[/\\?%*:|"<>]/g, "");
      };

      // Internal async function to resolve path
      const resolvePath = async () => {
        try {
          const id = req.body._id;
          // Default path if something goes wrong
          let relativePath = `../public/data/uploads/${folderType}/`;

          if (id && mongoose.Types.ObjectId.isValid(id)) {
            if (folderType === 'news') {
              const New = mongoose.model('New');
              const doc = await New.findById(id);
              if (doc) {
                const title = sanitize(doc.title);
                const timestamp = doc.create?.datetime ? new Date(doc.create.datetime).getTime() : Date.now();
                relativePath = `../public/data/uploads/news/${title}_${timestamp}/`;
              }
            }
            else if (folderType === 'artwork') {
              const Artwork = mongoose.model('Artwork');
              const doc = await Artwork.findById(id).populate('artist');
              if (doc && doc.artist) {
                const artistName = sanitize(doc.artist.name);
                const studentId = doc.artist.studentId || "unknown";
                const artworkTitle = sanitize(doc.title);
                relativePath = `../public/data/uploads/${studentId}_${artistName}/Artwork/`;
                file.customFilename = artworkTitle; // Save for filename function
              }
            }
            else if (folderType === 'submission') {
              const Submission = mongoose.model('Submission');
              const doc = await Submission.findById(id).populate('artist');
              if (doc) {
                const artist = Array.isArray(doc.artist) ? doc.artist[0] : doc.artist;
                const artistName = sanitize(artist?.name || "Artist");
                const studentId = artist?.studentId || "unknown";
                const subTitle = sanitize(doc.title);
                // Get assignment and artwork title from request body if provided
                const assignTitle = sanitize(req.body.assignmentTitle || "General");
                const artworkTitle = sanitize(req.body.artworkTitle || "Submission_Work");

                relativePath = `../public/data/uploads/${studentId}_${artistName}/Submission/${subTitle}/${assignTitle}/`;
                file.customFilename = artworkTitle;
              }
            }
            else if (folderType === 'profile') {
              const User = mongoose.model('User');
              const user = await User.findById(id);
              if (user) {
                const artistName = sanitize(user.name);
                const studentId = user.studentId || "unknown";
                relativePath = `../public/data/uploads/${studentId}_${artistName}/Profile/`;
              }
            }
          }

          const folderPath = path.join(__dirname, relativePath);
          if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
          }
          cb(null, folderPath);
        } catch (err) {
          console.error(`[UploadMiddleware] Error:`, err);
          cb(null, path.join(__dirname, `../public/data/uploads/${folderType}/`));
        }
      };

      resolvePath();
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);

      if (folderType === 'news') {
        try {
          const files = fs.readdirSync(file.destination);
          cb(null, `${files.length + 1}${ext}`);
        } catch (e) {
          cb(null, `1${ext}`);
        }
      } else if (file.customFilename) {
        cb(null, `${file.customFilename}${ext}`);
      } else {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${folderType}-${uniqueSuffix}${ext}`);
      }
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
    fileSize: 10 * 1024 * 1024, // Increase to 10 MB for high-quality art
  };

  const upload = multer({ storage, fileFilter, limits });

  return isMultiple
    ? upload.array(fieldName, maxFiles)
    : upload.single(fieldName);
};
