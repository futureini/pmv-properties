const cloudinary = require('cloudinary').v2;

// Values pasted into a hosting dashboard often carry stray spaces or quotes;
// clean them so a "looks right" key doesn't silently fail.
const clean = (v) => (v || '').trim().replace(/^["']|["']$/g, '');

const cloudName = clean(process.env.CLOUDINARY_CLOUD_NAME);
const apiKey = clean(process.env.CLOUDINARY_API_KEY);
const apiSecret = clean(process.env.CLOUDINARY_API_SECRET);

// Cloudinary is the permanent home for property photos (it keeps working when
// the project moves between your PC, Render, or any other host). If the three
// env vars are missing the app falls back to storing images on local disk,
// which is fine ONLY for localhost — see utils/imageProcessor.js.
const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });
}

// One clear line at boot, so you can tell from the server log which mode you're in.
if (isCloudinaryConfigured) {
  console.log(`[images] Cloudinary storage ON (cloud: ${cloudName})`);
} else {
  console.warn(
    '[images] Cloudinary is NOT configured (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are empty). ' +
      'Uploaded photos will be saved to this machine\'s disk only. That works on localhost but photos will disappear on a live host such as Render.'
  );
}

module.exports = { cloudinary, isCloudinaryConfigured };
