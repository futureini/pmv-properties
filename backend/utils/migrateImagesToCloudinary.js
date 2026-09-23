// Run once with:  npm run migrate:images          (add  -- --dry  to only preview)
//
// Moves property photos that were saved on this computer's disk ("/uploads/...")
// up to Cloudinary and updates the database with the new permanent URLs, so they
// show on the live site.
//
// Before running:
//   1. Put CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET in backend/.env
//   2. Point MONGO_URI at the database your LIVE site uses
//   3. Run it on the computer that still has the photo files in backend/uploads/
//
// Photos whose file no longer exists are listed at the end: re-upload those from
// Admin -> Properties -> Edit.
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Property = require('../models/Property');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
const DRY = process.argv.includes('--dry');

(async () => {
  if (!isCloudinaryConfigured) {
    console.error('Cloudinary is not configured. Fill in the three CLOUDINARY_* values in backend/.env first.');
    process.exit(1);
  }

  await connectDB();
  const properties = await Property.find({ 'images.url': /^\/uploads\// });
  console.log(`${properties.length} propert${properties.length === 1 ? 'y has' : 'ies have'} photos saved on local disk.${DRY ? ' (dry run: nothing will be changed)' : ''}\n`);

  let moved = 0;
  const missing = [];

  for (const property of properties) {
    const images = property.images.map((img) => ({ url: img.url, publicId: img.publicId }));
    let changed = false;

    for (let i = 0; i < images.length; i += 1) {
      const { url } = images[i];
      if (!url || !url.startsWith('/uploads/')) continue;

      const file = path.join(UPLOAD_DIR, path.basename(url));
      if (!fs.existsSync(file)) {
        missing.push(`${property.title} (${property._id}) -> ${url}`);
        continue;
      }
      if (DRY) {
        console.log(`would upload ${path.basename(url)}  [${property.title}]`);
        continue;
      }
      try {
        const result = await cloudinary.uploader.upload(file, { folder: 'pmv-properties', resource_type: 'image' });
        images[i] = { url: result.secure_url, publicId: result.public_id };
        changed = true;
        moved += 1;
        console.log(`uploaded ${path.basename(url)}  [${property.title}]`);
      } catch (err) {
        missing.push(`${property.title} (${property._id}) -> upload failed: ${err.message}`);
      }
    }

    if (changed) await Property.updateOne({ _id: property._id }, { $set: { images } });
  }

  console.log(`\nDone. ${moved} photo(s) moved to Cloudinary.`);
  if (missing.length) {
    console.log(`\n${missing.length} photo(s) could not be moved - re-upload these from the admin panel:`);
    missing.forEach((m) => console.log(`  - ${m}`));
  }
  await mongoose.disconnect();
  process.exit(0);
})();
