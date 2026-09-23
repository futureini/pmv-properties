const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protectAdmin } = require('../middleware/auth');
const ctrl = require('../controllers/propertyController');

// Public
router.get('/featured', ctrl.getFeatured);
router.get('/', ctrl.getProperties);

// Admin (declared before "/:id" so they aren't swallowed by the param route)
router.get('/admin/all', protectAdmin, ctrl.getAllForAdmin);
router.get('/admin/stats', protectAdmin, ctrl.getStats);
router.get('/admin/:id', protectAdmin, ctrl.getByIdForAdmin);
router.post('/', protectAdmin, upload.array('images', 5), ctrl.createProperty);
router.put('/:id', protectAdmin, upload.array('images', 5), ctrl.updateProperty);
router.delete('/:id', protectAdmin, ctrl.deleteProperty);

// Public (must come after the more specific admin routes above)
router.post('/:id/contact-click', ctrl.recordContactClick);
router.get('/:id', ctrl.getPropertyById);

module.exports = router;
