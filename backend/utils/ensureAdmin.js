const Admin = require('../models/Admin');

// Runs automatically every time the server boots (see server.js).
// Guarantees the admin login always works with whatever ADMIN_EMAIL /
// ADMIN_PASSWORD are set in .env — no manual "seed" or "reset" script to
// remember, and it behaves identically on localhost and on a live server.
//
// - If no admin exists for ADMIN_EMAIL yet, it creates one.
// - If the password in .env doesn't match what's saved, it resets it.
// - If everything already matches, it does nothing.
async function ensureAdminSeeded() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const username = (process.env.ADMIN_USERNAME || '').trim().toLowerCase() || undefined;

  if (!password) {
    console.warn('[ensureAdmin] ADMIN_PASSWORD not set in .env — skipping admin check.');
    return;
  }

  try {
    // Normal case: ADMIN_EMAIL is set, look up (or create) by email.
    // Fallback: ADMIN_EMAIL got removed/typo'd but ADMIN_USERNAME is set and an
    // admin already exists somewhere — sync onto that existing account instead
    // of silently doing nothing (this is what broke last time).
    let admin = email
      ? await Admin.findOne({ email: email.toLowerCase() })
      : username
      ? await Admin.findOne({ username })
      : null;

    if (!admin && !email) {
      console.warn(
        '[ensureAdmin] ADMIN_EMAIL is missing from .env (check for a duplicate ADMIN_USERNAME line that overwrote it) — skipping admin check.'
      );
      return;
    }

    if (!admin) {
      await Admin.create({ name: 'Admin', email, password, username });
      console.log(`[ensureAdmin] Created admin login for ${email}${username ? ` (username: ${username})` : ''}.`);
      return;
    }

    let changed = false;

    const matches = await admin.comparePassword(password);
    if (!matches) {
      admin.password = password; // pre('save') hook re-hashes it
      changed = true;
    }

    if (username && admin.username !== username) {
      admin.username = username;
      changed = true;
    }

    if (changed) {
      await admin.save();
      console.log(`[ensureAdmin] Synced admin login for ${admin.email} from .env${username ? ` (username: ${username})` : ''}.`);
    }
  } catch (err) {
    console.error('[ensureAdmin] Could not verify/create admin account:', err.message);
  }
}

module.exports = ensureAdminSeeded;
