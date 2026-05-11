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
          // Default path for system docs
          let relativePath = `../public/system/doc/`;

          if (id && mongoose.Types.ObjectId.isValid(id)) {
            if (folderType === 'news') {
              const New = mongoose.model('New');
              const doc = await New.findById(id);
              if (doc) {
                const title = sanitize(doc.title);
                const timestamp = doc.create?.datetime ? new Date(doc.create.datetime).getTime() : Date.now();
                relativePath = `../public/system/new/${title}_${timestamp}/`;
              }
            }
            else if (folderType === 'artwork') {
              const Artwork = mongoose.model('Artwork');
              const doc = await Artwork.findById(id).populate('artist');
              if (doc && doc.artist) {
                const artistName = sanitize(doc.artist.name);
                const studentId = doc.artist.studentId || doc.artist._id;
                const artworkTitle = sanitize(doc.title);
                // Structure: Artist/[ID]_[Name]/Artwork/[Title]/
                relativePath = `../public/account/Artist/${studentId}_${artistName}/Artwork/${artworkTitle}/`;
                file.customFilename = artworkTitle;
              }
            }
            else if (folderType === 'submission') {
              const Submission = mongoose.model('Submission');
              const doc = await Submission.findById(id).populate('artist');
              if (doc) {
                const artist = Array.isArray(doc.artist) ? doc.artist[0] : doc.artist;
                const artistName = sanitize(artist?.name || "Artist");
                const studentId = artist?.studentId || artist?._id || "unknown";
                const subTitle = sanitize(doc.title);
                const assignTitle = sanitize(req.body.assignmentTitle || "General");
                const artworkTitle = sanitize(req.body.artworkTitle || "Submission_Work");

                // Structure: Artist/[ID]_[Name]/Submission/[SubTitle]/[AssignTitle]/
                relativePath = `../public/account/Artist/${studentId}_${artistName}/Submission/${subTitle}/${assignTitle}/`;
                file.customFilename = artworkTitle;
              }
            }
            else if (folderType === 'profile') {
              const User = mongoose.model('User');
              const user = await User.findById(id);
              if (user) {
                const userName = sanitize(user.name);
                const studentId = user.studentId;
                if (studentId) {
                  // Artist
                  relativePath = `../public/account/Artist/${studentId}_${userName}/Profile/`;
                } else {
                  // Regular User
                  relativePath = `../public/account/User/${user._id}_${userName}/Profile/`;
                }
              }
            }
            else if (folderType === 'order') {
                // If it's an order (slip upload), we need to find the user
                const Order = mongoose.model('Order');
                const orderDoc = await Order.findById(id).populate('user');
                if (orderDoc && orderDoc.user) {
                    const userName = sanitize(orderDoc.user.name || orderDoc.contact?.name || "Customer");
                    const userId = orderDoc.user._id || orderDoc.user;
                    relativePath = `../public/account/User/${userId}_${userName}/Order/`;
                } else {
                    relativePath = `../public/account/User/Guest/Order/`;
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
          cb(null, path.join(__dirname, `../public/System/doc/`));
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
