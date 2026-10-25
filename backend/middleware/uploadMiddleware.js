const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const mfuDrive = require("../helpers/mfuDrive");
const { isAdmin, isSelf } = require('./userAccessMiddleware');

module.exports = function uploadImage(folderType, fieldName = "image", isMultiple = false, maxFiles = 10, authorizeUpload = null) {
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
                const artist = Array.isArray(doc.artist)
                  ? (req.submissionUploadArtist ? doc.artist.find(item=>String(item._id)===String(req.submissionUploadArtist)) : doc.artist[0])
                  : doc.artist;
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
        // Each upload gets a new URL even when the news title and folder stay the same.
        req._fileCounter = (req._fileCounter || 0) + 1;
        cb(null, `${req._fileCounter}-${require('crypto').randomBytes(8).toString('hex')}${ext}`);
      } else if (['submission', 'artwork'].includes(folderType) && file.customFilename) {
        cb(null, `${file.customFilename}-${require('crypto').randomBytes(8).toString('hex')}${ext}`);
      } else if (file.customFilename) {
        // For artwork/submission, keep the custom name
        // If it's multiple, we still need a unique suffix to avoid overwriting same custom name
        if (isMultiple) {
          req._fileCounter = (req._fileCounter || 0) + 1;
          cb(null, `${file.customFilename}-${req._fileCounter}${ext}`);
        } else {
          cb(null, `${file.customFilename}${ext}`);
        }
      } else {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, `${folderType}-${uniqueSuffix}${ext}`);
      }
    },
  });

  const validateFile = (req, file, cb) => {
    // Multipart identity must precede the file, as in the existing profile forms.
    // Reject before disk storage or the MFU Drive mirror can run.
    if (folderType === 'profile' && !isAdmin(req) && !isSelf(req, req.body._id)) {
      const error = new Error('Access to this account is not allowed.');
      error.status = 403;
      return cb(error);
    }
    const mimetype = /^image\/(jpeg|jpg|png|gif|webp)$/i.test(file.mimetype);
    const extname = /^\.(jpeg|jpg|png|gif|webp)$/i.test(path.extname(file.originalname));

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(Object.assign(new Error("Only image files are allowed! (jpeg, jpg, png, gif, webp)"), { status: 400 }));
  };

  const fileFilter = (req, file, cb) => {
    if (!['order', 'artwork', 'submission'].includes(folderType)) return validateFile(req, file, cb);
    // Ownership and order state must be checked before disk/cloud writes.
    const access = folderType === 'order' ? require('./orderAccessMiddleware')
      : folderType === 'artwork' ? require('./artworkAccessMiddleware') : require('./submissionAccessMiddleware');
    (authorizeUpload || access.authorizeUpload)(req)
      .then(() => validateFile(req, file, cb), cb);
  };

  const limits = {
    fileSize: 10 * 1024 * 1024, // Increase to 10 MB for high-quality art
  };

  const upload = multer({ storage, fileFilter, limits });
  const multerHandler = isMultiple
    ? upload.array(fieldName, maxFiles)
    : upload.single(fieldName);

  // Keep the existing local file as a short-lived/cache copy for PDF and email
  // workflows, then mirror every uploaded image to the shared MFU Drive.
  return (req, res, next) => {
    multerHandler(req, res, async (err) => {
      if (err && err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ code: '41300', message: 'Image exceeds the 10 MiB limit.' });
      if (err && [400, 403, 404, 409].includes(err.status)) return res.status(err.status).json({ code: String(err.status) + '00', message: err.message });
      if (err) return next(err);
      if (!mfuDrive.isEnabled()) return next();

      try {
        const files = [];
        if (req.file) files.push(req.file);
        if (Array.isArray(req.files)) files.push(...req.files);

        for (const file of files) {
          const relativePath = mfuDrive.relativePathFromPublicFolder(file.destination, file.filename);
          const uploaded = await mfuDrive.uploadLocalFile(relativePath, file.path, file.mimetype);
          file.mfuDrivePath = uploaded.relativePath;
          file.mfuDriveUrl = uploaded.url;
        }
        return next();
      } catch (driveError) {
        driveError.status = driveError.status || 502;
        return next(driveError);
      }
    });
  };
};
