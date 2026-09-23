// Run with: npm run reset:admin
// Creates the admin if it doesn't exist yet, OR resets the password on the
// existing admin, always using ADMIN_EMAIL / ADMIN_PASSWORD from .env.
// Use this any time you forget the admin login — it always works, unlike
// seed:admin which refuses to touch an account that already exists.
require('dotenv').config();
const connectDB = require('../config/db');
const Admin = require('../models/Admin');
const mongoose = require('mongoose');

(async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase() || undefined;

  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env first.');
    process.exit(1);
  }

  let admin = await Admin.findOne({ email: email.toLowerCase() });

  if (admin) {
    admin.password = password; // pre('save') hook re-hashes it
    if (username) admin.username = username;
    await admin.save();
    console.log(
      `Password reset for ${email}${username ? ` (username: ${username})` : ''}. Log in at /admin/login with the ADMIN_PASSWORD from .env.`
    );
  } else {
    admin = await Admin.create({ name: 'Admin', email, password, username });
    console.log(
      `Admin created for ${email}${username ? ` (username: ${username})` : ''}. Log in at /admin/login with the ADMIN_PASSWORD from .env.`
    );
  }

  await mongoose.disconnect();
  process.exit(0);
})();
