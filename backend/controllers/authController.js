const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// POST /api/auth/login  (admin only — there is no customer login, per spec)
// Accepts EITHER the short username (e.g. "futureini") or the full email in the
// same "identifier" field, so the admin doesn't have to type the email every time.
exports.login = async (req, res, next) => {
  try {
    const { identifier, email, password } = req.body;
    const id = (identifier || email || '').trim().toLowerCase();
    if (!id || !password) {
      return res.status(400).json({ message: 'Username/email and password are required.' });
    }

    const admin = await Admin.findOne({ $or: [{ username: id }, { email: id }] });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid username/email or password.' });
    }

    const token = signToken(admin._id);
    res.json({
      token,
      admin: { id: admin._id, name: admin.name, email: admin.email, username: admin.username },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  res.json({ admin: req.admin });
};
