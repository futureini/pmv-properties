const express = require('express');
const router = express.Router();
const { login, me } = require('../controllers/authController');
const { protectAdmin } = require('../middleware/auth');

router.post('/login', login);
router.get('/me', protectAdmin, me);

module.exports = router;
