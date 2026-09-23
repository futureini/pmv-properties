import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch } from 'react-icons/fi';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import PropertyCard from '../components/PropertyCard.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import api from '../api.js';
import { CATEGORIES } from '../utils/categories.js';
import { canonicalUrl, DEFAULT_OG_IMAGE } from '../utils/seo.js';

const PAGE_SIZE = 12;

/**
 * "Properties" tab in the bottom nav — unlike /category/:slug (reached from the
 * Home page's category grid, always scoped to ONE category), this page shows
 * every active listing across ALL categories, with a category chip row
 * (All, Buy/Sale, Rent, Land/Plot, Flat, Shop/Commercial, Lease) to filter by.
 * "All" sends no category filter at all, so nothing uploaded is ever hidden.
 */
export default function AllProperties() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState(null); // null = All
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params = { page: 1, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;

    api
      .get('/properties', { params })
      .then(({ data }) => {
        setProperties(data.properties);
        setTotal(data.total);
      })
      .catch(() => {
        setProperties([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [activeCategory, search]);

  const loadMore = () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    const params = { page: nextPage, limit: PAGE_SIZE };
    if (activeCategory) params.category = activeCategory;
    if (search) params.q = search;

    api
      .get('/properties', { params })
      .then(({ data }) => {
        setProperties((prev) => [...prev, ...data.properties]);
        setTotal(data.total);
        setPage(nextPage);
      })
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="app-shell">
      <Helmet>
        <title>Properties | PMV Properties</title>
        <meta name="description" content="Browse every property listed with PMV Properties, across all categories." />
        <link rel="canonical" href={canonicalUrl('/properties')} />
        <meta property="og:title" content="Properties | PMV Properties" />
        <meta property="og:description" content="Browse every property listed with PMV Properties, across all categories." />
        <meta property="og:url" content={canonicalUrl('/properties')} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      </Helmet>

      <Header title="Properties" subtitle="Ponnamaravathi" showSearch={false} />

      <div className="page-scroll page-fade">
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 bg-brand-50 border border-brand/15 rounded-full px-4 py-2.5">
            <FiSearch className="text-gray-400 shrink-0" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all properties..."
              className="flex-1 min-w-0 text-sm bg-transparent outline-none"
            />
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`tap-scale shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                !activeCategory ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600'
              }`}
            >
              All
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActiveCategory(c.slug)}
                className={`tap-scale shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border ${
                  activeCategory === c.slug ? 'bg-brand text-white border-brand' : 'border-gray-300 text-gray-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 mt-4 pb-6">
          {loading ? (
            <Loader label="Loading properties..." />
          ) : properties.length === 0 ? (
            <EmptyState
              title="No properties found"
              subtitle="Try a different category or search term, or check back soon for new listings."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                {properties.map((p) => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
              {properties.length < total && (
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="tap-scale w-full mt-4 border border-brand text-brand font-semibold text-sm py-2.5 rounded-xl disabled:opacity-60"
                >
                  {loadingMore ? 'Loading...' : `Load more (${properties.length} of ${total})`}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
