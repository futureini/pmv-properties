// -----------------------------------------------------------------------------
// HOME PAGE AD BANNERS  (advertisements, offers, discounts, announcements ONLY)
//
// These are NOT property photos. To add / change a banner:
//   1. Save the image in  src/assets/banners/  (16:9, about 1000px wide, .webp or .jpg)
//   2. Import it below and add one line to BANNERS.
// Nothing needs to be uploaded to a server: Vite bundles these images with the
// app, so they load exactly the same on localhost and on the live site.
//
//   to: optional page to open when the banner is tapped (e.g. '/category/rent',
//       '/post-property'). Leave it out for a non-clickable banner.
// -----------------------------------------------------------------------------
import rentSell from '../assets/banners/banner-rent-sell.webp';
import findProperty from '../assets/banners/banner-find-property.webp';
import landPlot from '../assets/banners/banner-land-plot.webp';
import rentShop from '../assets/banners/banner-rent-shop.webp';

export const BANNERS = [
  {
    id: 'rent-sell',
    src: rentSell,
    alt: 'PMV Properties - buy or sell your home the simple way',
    to: '/category/buy-sale',
  },
  {
    id: 'find-property',
    src: findProperty,
    alt: 'Find a home for rent that feels right, with PMV Properties',
    to: '/category/rent',
  },
  {
    id: 'land-plot',
    src: landPlot,
    alt: 'Land and plots for sale in Ponnamaravathi with clear titles',
    to: '/category/land-plot',
  },
  {
    id: 'rent-shop',
    src: rentShop,
    alt: 'Find your perfect shop for sale or rent with PMV Properties',
    to: '/category/shop-commercial',
  },
];
