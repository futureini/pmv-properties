const mongoose = require('mongoose');

// Covers 3 sources: an enquiry raised on a specific property, a
// "Post your Property" submission, and a "I need a Property" request.
const enquirySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['property-enquiry', 'post-property', 'need-property', 'call', 'whatsapp'],
      default: 'property-enquiry',
    },
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property' },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    message: { type: String, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['New', 'Contacted', 'Closed'], default: 'New' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enquiry', enquirySchema);
