const mongoose = require('mongoose');

// Categories drive the "Home -> Listing -> Details" structure requested:
// buy-sale, rent, land-plot, flat, shop-commercial, lease
const CATEGORIES = ['buy-sale', 'rent', 'land-plot', 'flat', 'shop-commercial', 'lease'];

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String }, // cloudinary public id, used to delete the image later
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    propertyType: {
      type: String, // House, Flat, Land, Shop, Commercial, Office ...
      required: true,
      trim: true,
    },
    listingType: {
      type: String, // Sale / Rent / Lease - shown as the small red badge on cards
      required: true,
      enum: ['Sale', 'Rent', 'Lease'],
    },

    price: { type: Number, required: true, min: 0 },
    // For rent/lease, this is the recurring period label, e.g. "/month". Empty for sale.
    priceUnit: { type: String, default: '' },

    location: { type: String, required: true, trim: true }, // e.g. "Pudukkottai"
    address: { type: String, trim: true },

    area: { type: Number }, // in sqft or cents, see areaUnit
    areaUnit: { type: String, default: 'sq.ft' },

    bedrooms: { type: Number },
    bathrooms: { type: Number },
    floor: { type: String },
    parkingAvailable: { type: Boolean, default: false },
    waterSupply: { type: Boolean, default: false },

    // Facing / lease duration are ONLY shown for categories other than "rent"
    // (removed from Rent property details per product spec).
    facing: { type: String },
    leaseDuration: { type: String },
    availableFrom: { type: String },

    description: { type: String, trim: true, maxlength: 2000 },

    images: {
      type: [imageSchema],
      validate: [(arr) => arr.length <= 5, 'A maximum of 5 images is allowed per property'],
    },

    // Owner details are PRIVATE — never sent to the public API.
    // Only the admin can view them (admin-only routes / admin JWT required).
    ownerName: { type: String, trim: true },
    ownerPhone: { type: String, trim: true, select: false },

    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    views: { type: Number, default: 0 },

    // How many times customers tapped Call / WhatsApp on this property.
    // Counted even when the customer never fills a form. Admin-only.
    callClicks: { type: Number, default: 0 },
    whatsappClicks: { type: Number, default: 0 },
  },
  { timestamps: true }
);

propertySchema.index({ title: 'text', location: 'text', description: 'text' });

module.exports = mongoose.model('Property', propertySchema);
module.exports.CATEGORIES = CATEGORIES;
