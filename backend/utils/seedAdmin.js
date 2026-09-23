// Run once with: npm run seed:admin
// Creates the first admin login using ADMIN_EMAIL / ADMIN_PASSWORD from .env
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
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env first.');
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin already exists for ${email}. Nothing to do.`);
  } else {
    await Admin.create({ name: 'Admin', email, password, username });
    console.log(
      `Admin created for ${email}${username ? ` (username: ${username})` : ''}. You can now log in from /admin/login.`
    );
  }

  await mongoose.disconnect();
  process.exit(0);
})();
