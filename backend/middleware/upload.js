const multer = require('multer');

// Images are received in memory, then resized + compressed with sharp
// (see controllers/propertyController.js) before being saved/uploaded.
// Max 5 images, 8MB each raw upload cap (compressed heavily afterwards).
// No video mimetypes are accepted at all.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG or WEBP images are allowed (no videos).'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { files: 5, fileSize: 8 * 1024 * 1024 },
});

module.exports = upload;
