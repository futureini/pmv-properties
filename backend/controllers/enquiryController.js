const Enquiry = require('../models/Enquiry');
const notifyAdmin = require('../utils/notify');

const NOTIFIABLE_TYPES = ['post-property', 'need-property', 'property-enquiry'];

// POST /api/enquiries (public)
// Used for: property enquiry form, "Post your Property", "I need a Property",
// and to log every Call/WhatsApp tap (all of which route to the admin number).
exports.createEnquiry = async (req, res, next) => {
  try {
    const { type, property, name, phone, email, message } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone number are required.' });
    }

    const enquiry = await Enquiry.create({ type, property, name, phone, email, message });

    // Instantly notify the admin (Telegram + email) so they can call/WhatsApp
    // the customer right away. Fire-and-forget: never delays or fails the
    // customer's response, and every failure is caught inside notifyAdmin.
    if (NOTIFIABLE_TYPES.includes(enquiry.type)) {
      enquiry
        .populate('property', 'title')
        .then((populated) => notifyAdmin(populated))
        .catch((err) => console.error('[notify] Could not send admin notification:', err.message));
    }

    res.status(201).json({ enquiry, message: 'Thanks! Our team will contact you shortly.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/enquiries (admin only)
exports.getEnquiries = async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const [enquiries, total] = await Promise.all([
      Enquiry.find(filter)
        .populate('property', 'title category location')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Enquiry.countDocuments(filter),
    ]);

    res.json({ enquiries, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// PUT /api/enquiries/:id (admin only) — update status (New/Contacted/Closed)
exports.updateEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json({ enquiry });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/enquiries/:id (admin only)
exports.deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
    if (!enquiry) return res.status(404).json({ message: 'Enquiry not found.' });
    res.json({ message: 'Enquiry deleted.' });
  } catch (err) {
    next(err);
  }
};
