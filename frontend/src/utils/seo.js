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

// Location-rich titles/descriptions for each category page (what Google shows
// in search results). Keep the town names — people search "house for rent in
// Ponnamaravathi", not just "house for rent".
export const CATEGORY_SEO = {
  'buy-sale': {
    title: 'Houses & Property for Sale in Ponnamaravathi, Pudukkottai | PMV Properties',
    description:
      'Browse houses, plots and property for sale in Ponnamaravathi, Pudukkottai and nearby towns. View photos and prices, then call or WhatsApp PMV Properties.',
  },
  rent: {
    title: 'House for Rent in Ponnamaravathi, Pudukkottai | PMV Properties',
    description:
      'Find houses and homes for rent in Ponnamaravathi, Pudukkottai and nearby areas. See photos, rent and location, then call or WhatsApp PMV Properties.',
  },
  'land-plot': {
    title: 'Land & Plots for Sale in Ponnamaravathi, Pudukkottai | PMV Properties',
    description:
      'Land, house plots and agricultural land for sale in Ponnamaravathi, Pudukkottai and surrounding areas. See details and contact PMV Properties.',
  },
  flat: {
    title: 'Flats & Apartments in Ponnamaravathi, Pudukkottai | PMV Properties',
    description:
      'Flats and apartments for sale or rent in Ponnamaravathi, Pudukkottai and nearby towns. Browse listings with PMV Properties.',
  },
  'shop-commercial': {
    title: 'Shops & Commercial Space in Ponnamaravathi, Pudukkottai | PMV Properties',
    description:
      'Shops, offices and commercial buildings for rent, lease or sale in Ponnamaravathi, Pudukkottai and nearby areas. Browse with PMV Properties.',
  },
  lease: {
    title: 'Property for Lease in Ponnamaravathi, Pudukkottai | PMV Properties',
    description:
      'Houses, shops and land available for lease in Ponnamaravathi, Pudukkottai and surrounding areas. Browse lease listings with PMV Properties.',
  },
};

export const HOME_TITLE = 'Property in Ponnamaravathi & Pudukkottai | Buy, Rent, Lease – PMV Properties';
export const HOME_DESCRIPTION =
  'PMV Properties: houses, flats, land plots, shops and commercial space for sale, rent and lease in Ponnamaravathi, Pudukkottai and nearby towns. Call or WhatsApp us today.';
