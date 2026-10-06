const express = require('express');
const Property = require('../models/Property');

const router = express.Router();
const SITE = (process.env.SITE_URL || 'https://pmvproperty.in').replace(/\/+$/, '');

// GET /api/sitemap-properties.xml
// Lists every Active property page so Google can find and index each listing.
// The website serves it at https://pmvproperty.in/sitemap-properties.xml via a
// rewrite in frontend/vercel.json (a sitemap must live on the same domain).
router.get('/sitemap-properties.xml', async (req, res, next) => {
  try {
    const props = await Property.find({ status: 'Active' })
      .select('_id updatedAt')
      .sort({ updatedAt: -1 })
      .limit(5000)
      .lean();

    const urls = props
      .map((p) => {
        const last = p.updatedAt ? `\n    <lastmod>${new Date(p.updatedAt).toISOString()}</lastmod>` : '';
        return `  <url>\n    <loc>${SITE}/property/${p._id}</loc>${last}\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
      })
      .join('\n');

    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
