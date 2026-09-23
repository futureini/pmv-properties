const Property = require('../models/Property');
const { processAndStoreImages, deleteStoredImage } = require('../utils/imageProcessor');

// Fields that are ONLY ever returned to admins. Public responses must
// never leak the owner's phone number (spec: customers never see it).
const PUBLIC_SELECT = '-ownerPhone -callClicks -whatsappClicks';

// GET /api/properties  (public) — supports category, type, search, price/area filters + pagination
exports.getProperties = async (req, res, next) => {
  try {
    const {
      category,
      propertyType,
      listingType,
      q,
      minPrice,
      maxPrice,
      location,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { status: 'Active' };
    if (category) filter.category = category;
    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (location) filter.location = new RegExp(location, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(filter, PUBLIC_SELECT).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Property.countDocuments(filter),
    ]);

    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/properties/featured (public) — for the Home page "Featured Properties" rail
exports.getFeatured = async (req, res, next) => {
  try {
    const properties = await Property.find({ status: 'Active' }, PUBLIC_SELECT)
      .sort({ views: -1, createdAt: -1 })
      .limit(6);
    res.json({ properties });
  } catch (err) {
    next(err);
  }
};

// GET /api/properties/:id (public)
exports.getPropertyById = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).select(PUBLIC_SELECT);

    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json({ property });
  } catch (err) {
    next(err);
  }
};

// POST /api/properties/:id/contact-click (public) — body { type: 'call' | 'whatsapp' }
// Counts a Call / WhatsApp tap so the admin can see which listings get interest
// even when the customer doesn't fill in a form. Never blocks the customer.
exports.recordContactClick = async (req, res) => {
  try {
    const field = { call: 'callClicks', whatsapp: 'whatsappClicks' }[req.body?.type];
    if (!field) return res.status(400).json({ message: 'type must be "call" or "whatsapp".' });
    await Property.updateOne({ _id: req.params.id }, { $inc: { [field]: 1 } });
    res.json({ ok: true });
  } catch {
    res.json({ ok: false }); // analytics must never surface an error to the customer
  }
};

// ---- ADMIN ONLY BELOW (protectAdmin middleware applied in routes) ----

// GET /api/properties/admin/all — includes owner phone + inactive listings
exports.getAllForAdmin = async (req, res, next) => {
  try {
    const { category, status, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (q) filter.$text = { $search: q };

    const skip = (Number(page) - 1) * Number(limit);
    const [properties, total] = await Promise.all([
      Property.find(filter).select('+ownerPhone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Property.countDocuments(filter),
    ]);

    res.json({ properties, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.getByIdForAdmin = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).select('+ownerPhone');
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json({ property });
  } catch (err) {
    next(err);
  }
};

// POST /api/properties  (admin) — multipart/form-data, field name "images" (max 5)
exports.createProperty = async (req, res, next) => {
  try {
    const images = await processAndStoreImages(req.files);
    const property = await Property.create({ ...req.body, images });
    res.status(201).json({ property });
  } catch (err) {
    next(err);
  }
};

// PUT /api/properties/:id (admin) — new images (if any) are appended, existing ones kept
// unless removedImageUrls (JSON array of urls) is sent to delete specific ones first.
exports.updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).select('+ownerPhone');
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    if (req.body.removedImageUrls) {
      const toRemove = JSON.parse(req.body.removedImageUrls);
      const removedImgs = property.images.filter((img) => toRemove.includes(img.url));
      await Promise.all(removedImgs.map(deleteStoredImage));
      property.images = property.images.filter((img) => !toRemove.includes(img.url));
    }

    if (req.files && req.files.length) {
      const newImages = await processAndStoreImages(req.files);
      property.images = [...property.images, ...newImages].slice(0, 5);
    }

    const { removedImageUrls, ...fields } = req.body;
    Object.assign(property, fields);

    await property.save();
    res.json({ property });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/properties/:id (admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    await Promise.all(property.images.map(deleteStoredImage));
    await property.deleteOne();
    res.json({ message: 'Property deleted.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/properties/admin/stats — powers the admin dashboard cards + chart
exports.getStats = async (req, res, next) => {
  try {
    const [totalProperties, activeListings, totalViewsAgg] = await Promise.all([
      Property.countDocuments(),
      Property.countDocuments({ status: 'Active' }),
      Property.aggregate([{ $group: { _id: null, views: { $sum: '$views' } } }]),
    ]);

    const recent = await Property.find().sort({ createdAt: -1 }).limit(5).select('-ownerPhone');

    res.json({
      totalProperties,
      activeListings,
      totalViews: totalViewsAgg[0]?.views || 0,
      recent,
    });
  } catch (err) {
    next(err);
  }
};
