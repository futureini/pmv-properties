import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch } from 'react-icons/fi';
import { MdAddHome, MdManageSearch } from 'react-icons/md';
import logo from '../assets/logo-sm.webp';
import BottomNav from '../components/BottomNav.jsx';
import HeroSlider from '../components/HeroSlider.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import Loader from '../components/Loader.jsx';
import { HeaderCall } from '../components/ContactButtons.jsx';
import api from '../api.js';
import { canonicalUrl, DEFAULT_OG_IMAGE } from '../utils/seo.js';
import iconRent from '../assets/icons/icon-rent.png';
import iconBuySale from '../assets/icons/icon-buy-sale.png';
import iconLandPlot from '../assets/icons/icon-land-plot.png';
import iconFlat from '../assets/icons/icon-flat.png';
import iconShop from '../assets/icons/icon-shop.png';
import iconLease from '../assets/icons/icon-lease.png';

// Each category's own full-colour artwork (its "default" colours), not a
// single flat brand-colour glyph, per the approved icon set.
const CATEGORY_BUTTONS = [
  { slug: 'rent', label: 'Rent', icon: iconRent },
  { slug: 'buy-sale', label: 'Buy / Sale', icon: iconBuySale },
  { slug: 'land-plot', label: 'Land / Plot', icon: iconLandPlot },
  { slug: 'flat', label: 'Flat', icon: iconFlat },
  { slug: 'shop-commercial', label: 'Shop / Commercial', icon: iconShop },
  { slug: 'lease', label: 'Lease', icon: iconLease },
];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/properties/featured')
      .then(({ data }) => setFeatured(data.properties))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/category/buy-sale?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="app-shell">
      <Helmet>
        <title>PMV Properties | Find Your Dream Property</title>
        <meta
          name="description"
          content="Browse houses, flats, land and commercial properties for sale, rent and lease with PMV Properties."
        />
        <link rel="canonical" href={canonicalUrl('/home')} />
        <meta property="og:title" content="PMV Properties | Find Your Dream Property" />
        <meta
          property="og:description"
          content="Browse houses, flats, land and commercial properties for sale, rent and lease with PMV Properties."
        />
        <meta property="og:url" content={canonicalUrl('/home')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <div className="page-scroll page-fade">
        {/* Brand header: the logo is designed for a white background, so the header is white,
            with a green-to-red line echoing the swoosh under the logo. */}
        <div className="bg-white px-4 pt-4 pb-4 rounded-b-3xl shadow-card relative">
          <div className="flex items-center justify-between gap-3">
            <img src={logo} alt="PMV Properties" width="180" height="82" className="h-12 w-auto" />
            <HeaderCall />
          </div>

          <form onSubmit={handleSearch} className="mt-3" role="search">
            <div className="flex items-center gap-2 bg-brand-50 border border-brand/15 rounded-full px-4 py-2.5">
              <FiSearch className="text-brand shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by location, property type..."
                aria-label="Search properties"
                className="flex-1 min-w-0 text-sm text-ink bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
          </form>
          <div className="absolute bottom-0 inset-x-6 flex h-[3px] translate-y-1/2 gap-1" aria-hidden="true">
            <span className="flex-[4] rounded-full bg-brand" />
            <span className="flex-1 rounded-full bg-accent" />
          </div>
        </div>

        {/* Advertisement / offers banner carousel */}
        <HeroSlider />

        {/* Category grid */}
        <section className="px-4 mt-4">
          <div className="bg-white rounded-xl2 shadow-card p-4">
            <p className="text-sm font-semibold text-ink mb-3">What are you looking for?</p>
            <div className="grid grid-cols-3 gap-2 min-[380px]:gap-3">
              {CATEGORY_BUTTONS.map(({ slug, label, icon }) => (
                <button
                  key={slug}
                  onClick={() => navigate(`/category/${slug}`)}
                  className="tap-scale flex flex-col items-center gap-1.5 py-3 rounded-xl bg-brand-50/70 hover:bg-brand-100"
                >
                  <span className="w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                    <img
                      src={icon}
                      alt=""
                      aria-hidden="true"
                      className="w-full h-full object-contain drop-shadow-sm"
                      loading="lazy"
                      width="64"
                      height="64"
                    />
                  </span>
                  <span className="text-[11px] font-medium text-ink text-center leading-tight">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Post / Need a property: two compact side-by-side buttons */}
        <section className="px-4 mt-4 grid grid-cols-2 gap-2.5">
          <button
            onClick={() => navigate('/post-property')}
            className="tap-scale flex h-[58px] items-center gap-1.5 rounded-2xl bg-accent px-2 text-left text-white shadow-card"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 min-[400px]:h-8 min-[400px]:w-8 min-[400px]:rounded-xl">
              <MdAddHome size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[11px] font-semibold min-[400px]:text-[13px]">
                Post Your Property
              </span>
              <span className="block truncate text-[8.5px] text-white/90 min-[400px]:text-[10px]">
                List your property for FREE
              </span>
            </span>
          </button>
          <button
            onClick={() => navigate('/need-property')}
            className="tap-scale flex h-[58px] items-center gap-1.5 rounded-2xl bg-brand px-2 text-left text-white shadow-card"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/20 min-[400px]:h-8 min-[400px]:w-8 min-[400px]:rounded-xl">
              <MdManageSearch size={22} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-[11px] font-semibold min-[400px]:text-[13px]">
                I Need a Property
              </span>
              <span className="block truncate text-[8.5px] text-white/90 min-[400px]:text-[10px]">
                Tell us your requirement
              </span>
            </span>
          </button>
        </section>

        {/* Featured properties */}
        <section className="px-4 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink text-sm">Featured Properties</h2>
            <button onClick={() => navigate('/properties')} className="text-accent text-xs font-semibold">
              View All
            </button>
          </div>

          {loading ? (
            <Loader label="Loading featured properties..." />
          ) : featured.length === 0 ? (
            <p className="text-xs text-gray-400 py-6 text-center">
              No properties yet. Check back soon, or add one from the admin panel.
            </p>
          ) : (
            <div className="-mx-4 px-4 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {featured.map((p) => (
                <div key={p._id} className="w-[46%] min-w-[46%] snap-start">
                  <PropertyCard property={p} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  );
}
