// Single source of truth for the 5 (+ Rent) category structure requested:
// Home -> Category Listing -> Property Details, for every category below.
import { API_ORIGIN } from '../api.js';
import placeholder from '../assets/placeholder-property.svg';

export const CATEGORIES = [
  { slug: 'buy-sale', label: 'Buy / Sale', color: 'bg-brand' },
  { slug: 'rent', label: 'Rent', color: 'bg-brand' },
  { slug: 'land-plot', label: 'Land / Plot', color: 'bg-brand' },
  { slug: 'flat', label: 'Flat', color: 'bg-brand' },
  { slug: 'shop-commercial', label: 'Shop / Commercial', color: 'bg-brand' },
  { slug: 'lease', label: 'Lease', color: 'bg-brand' },
];

export const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

export function formatPrice(price) {
  if (price == null) return '';
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

// Bundled fallback picture (never depends on the internet or the API server).
export const PLACEHOLDER_IMAGE = placeholder;

/**
 * Turns whatever is stored in the database into a URL the browser can load,
 * the same way on localhost and on the live server:
 *   - Cloudinary / any full URL  -> used as-is (plus a size/format optimisation
 *                                   for Cloudinary so pages load faster)
 *   - "/uploads/abc.jpg" (saved on the API server's disk) -> API origin prefixed
 *   - empty                       -> bundled placeholder
 * `width` (optional) asks Cloudinary for a smaller copy, e.g. 600 for cards.
 */
export function resolveImageUrl(url, width) {
  if (!url || typeof url !== 'string') return PLACEHOLDER_IMAGE;
  const clean = url.trim();
  if (!clean) return PLACEHOLDER_IMAGE;

  // Protocol-relative or plain http(s) URL
  if (/^(https?:)?\/\//i.test(clean)) {
    const abs = clean.startsWith('//') ? `https:${clean}` : clean;
    return optimiseCloudinary(abs, width);
  }

  // Path on the API server, e.g. /uploads/123.jpg
  const path = clean.startsWith('/') ? clean : `/${clean}`;
  return `${API_ORIGIN}${path}`;
}

// Inserts f_auto,q_auto (+ width cap) into a plain Cloudinary delivery URL:
//   .../image/upload/v123/pmv-properties/x.jpg
//   .../image/upload/f_auto,q_auto,w_600,c_limit/v123/pmv-properties/x.jpg
// Anything else (other hosts, URLs that already carry transformations) is
// returned untouched.
function optimiseCloudinary(url, width) {
  if (!/^https:\/\/res\.cloudinary\.com\//i.test(url)) return url;
  const marker = '/image/upload/';
  const i = url.indexOf(marker);
  if (i === -1) return url;
  const rest = url.slice(i + marker.length);
  if (!/^v\d+\//.test(rest)) return url; // already has transformations
  const t = ['f_auto', 'q_auto'];
  if (width) t.push(`w_${width}`, 'c_limit');
  return `${url.slice(0, i + marker.length)}${t.join(',')}/${rest}`;
}
