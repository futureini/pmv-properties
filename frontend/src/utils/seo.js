// Small SEO helper shared by every page's <Helmet> block.
//
// SITE_URL is the fixed production domain, NOT window.location.origin.
// Using the browser origin made canonical / og:url point at
// pmv-properties.vercel.app whenever the site was opened via the Vercel URL,
// which lets Google index that domain instead of pmvproperty.in.
export const SITE_URL = 'https://pmvproperty.in';

// Absolute URL to the default social-share image (1200x630 banner in /public).
// Used as the og:image fallback on pages that don't have their own photo
// (Home, Properties, category pages). Property detail pages should pass
// their own photo instead — see PropertyDetails.jsx.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

// Builds a canonical URL for the current path, e.g. canonicalUrl('/category/rent').
export function canonicalUrl(pathname) {
  return `${SITE_URL}${pathname}`;
}

// og:image must be a full https:// URL or WhatsApp/Facebook may ignore it.
// Falls back to the default banner for anything relative or non-http.
export function absoluteImageUrl(url) {
  return typeof url === 'string' && /^https?:\/\//i.test(url) ? url : DEFAULT_OG_IMAGE;
}
