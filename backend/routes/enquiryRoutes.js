const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/enquiryController');

router.post('/', ctrl.createEnquiry); // public
router.get('/', protectAdmin, ctrl.getEnquiries);
router.put('/:id', protectAdmin, ctrl.updateEnquiry);
router.delete('/:id', protectAdmin, ctrl.deleteEnquiry);

module.exports = router;
