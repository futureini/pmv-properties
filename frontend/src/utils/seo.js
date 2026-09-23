// Small SEO helper shared by every page's <Helmet> block.
//
// SITE_URL is read from the actual browser address bar (window.location.origin)
// rather than hardcoded, so canonical / og:url tags are automatically correct
// on localhost, on a Vercel preview URL, and on your final production domain
// — nothing to edit here when you move hosts.
export const SITE_URL = typeof window !== 'undefined' ? window.location.origin : '';

// Absolute URL to the default social-share image (the PMV logo mark).
// Used as the og:image fallback on pages that don't have their own photo
// (Home, Properties, category pages). Property detail pages should pass
// their own photo instead — see PropertyDetails.jsx.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512.png`;

// Builds a canonical URL for the current path, e.g. canonicalUrl('/category/rent').
export function canonicalUrl(pathname) {
  return `${SITE_URL}${pathname}`;
}
