const sharp = require('sharp');
const streamifier = require('streamifier');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');
const path = require('path');
const fs = require('fs');

// Fixed target size keeps every property card/gallery image the same
// aspect ratio so the responsive grid never jumps around, while sharp's
// compression keeps page-load fast on mobile data.
const TARGET_WIDTH = 1000;
const TARGET_HEIGHT = 750; // 4:3, matches the property-card image slot
const JPEG_QUALITY = 78;

async function compressImage(buffer) {
  return sharp(buffer)
    .resize(TARGET_WIDTH, TARGET_HEIGHT, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();
}

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pmv-properties', resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

const LOCAL_UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Hosts whose disk is wiped on every deploy/restart. Saving photos there would
// look fine at first and then turn into broken images later, so on those hosts
// we refuse to save locally and tell the admin what to fix instead.
// (Set ALLOW_LOCAL_IMAGE_STORAGE=true only if you really know your disk persists.)
function isEphemeralHost() {
  if (String(process.env.ALLOW_LOCAL_IMAGE_STORAGE).toLowerCase() === 'true') return false;
  return Boolean(
    process.env.NODE_ENV === 'production' ||
      process.env.RENDER || // Render sets this automatically
      process.env.VERCEL ||
      process.env.RAILWAY_ENVIRONMENT ||
      process.env.FLY_APP_NAME ||
      process.env.DYNO // Heroku
  );
}

function storageNotConfiguredError() {
  const err = new Error(
    'Photo storage is not set up on this server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in the server environment variables, then redeploy.'
  );
  err.statusCode = 503;
  return err;
}

async function saveBufferLocally(buffer) {
  if (!fs.existsSync(LOCAL_UPLOAD_DIR)) fs.mkdirSync(LOCAL_UPLOAD_DIR, { recursive: true });
  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
  fs.writeFileSync(path.join(LOCAL_UPLOAD_DIR, filename), buffer);
  return { url: `/uploads/${filename}`, publicId: null };
}

/**
 * Compresses + resizes each uploaded image, then stores it either on
 * Cloudinary (production/recommended) or on local disk (localhost dev).
 * Returns an array of { url, publicId } ready to save on Property.images.
 */
async function processAndStoreImages(files = []) {
  if (files.length && !isCloudinaryConfigured && isEphemeralHost()) {
    throw storageNotConfiguredError();
  }

  const limited = files.slice(0, 5); // hard cap of 5 images, enforced again here
  const results = [];

  for (const file of limited) {
    const compressed = await compressImage(file.buffer);
    const stored = isCloudinaryConfigured
      ? await uploadBufferToCloudinary(compressed)
      : await saveBufferLocally(compressed);
    results.push(stored);
  }
  return results;
}

async function deleteStoredImage(image) {
  if (!image) return;
  if (image.publicId && isCloudinaryConfigured) {
    await cloudinary.uploader.destroy(image.publicId).catch(() => {});
  } else if (image.url && image.url.startsWith('/uploads/')) {
    const filePath = path.join(LOCAL_UPLOAD_DIR, path.basename(image.url));
    fs.unlink(filePath, () => {});
  }
}

module.exports = { processAndStoreImages, deleteStoredImage, isEphemeralHost };
