import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch } from 'react-icons/fi';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../api.js';
import { CATEGORY_MAP } from '../utils/categories.js';
import { canonicalUrl, DEFAULT_OG_IMAGE } from '../utils/seo.js';

// Quick "type" filter chips shown per category (matches the mockup's
// House / Flat / Land / Shop / Commercial sub-tabs on each listing page).
const TYPE_FILTERS = {
  'buy-sale': ['House', 'Flat', 'Land'],
  rent: ['House', 'Flat', 'Shop'],
  'land-plot': ['Residential', 'Agricultural', 'Commercial'],
  flat: ['1 BHK', '2 BHK', '3 BHK'],
  'shop-commercial': ['Shop', 'Office', 'Warehouse'],
  lease: ['Shop', 'Office', 'House'],
};

export default function CategoryListing() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = CATEGORY_MAP[slug];

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState(null);
  const [search, setSearch] = useState(searchParams.get('q') || '');

  useEffect(() => {
    setLoading(true);
    const params = { category: slug };
    if (activeType) params.propertyType = activeType;
    if (search) params.q = search;

    api
      .get('/properties', { params })
      .then(({ data }) => setProperties(data.properties))
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [slug, activeType, search]);

  if (!category) {
    return (
      <div className="app-shell items-center justify-center">
        <EmptyState title="Category not found" />
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Helmet>
        <title>{category.label} Properties | PMV Properties</title>
        <meta name="description" content={`Browse ${category.label} properties available with PMV Properties.`} />
        <link rel="canonical" href={canonicalUrl(`/category/${slug}`)} />
        <meta property="og:title" content={`${category.label} Properties | PMV Properties`} />
        <meta property="og:description" content={`Browse ${category.label} properties available with PMV Properties.`} />
        <meta property="og:url" content={canonicalUrl(`/category/${slug}`)} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <Header title={category.label} subtitle="Ponnamaravathi" />

      <div className="page-scroll page-fade">
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 bg-brand-50 border border-brand/15 rounded-full px-4 py-2.5">
            <FiSearch className="text-gray-400" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${category.label.toLowerCase()}...`}
              className="flex-1 text-sm bg-transparent outline-none"
            />
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveType(null)}
              className={`tap-scale shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                !activeType ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600'
              }`}
            >
              All
            </button>
            {(TYPE_FILTERS[slug] || []).map((t) => (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                className={`tap-scale shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  activeType === t ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-4">
          {loading ? (
            <Loader label={`Loading ${category.label} listings...`} />
          ) : properties.length === 0 ? (
            <EmptyState
              title="No properties found"
              subtitle="Try a different filter, or check back soon for new listings."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {properties.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
