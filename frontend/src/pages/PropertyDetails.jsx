import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiMapPin } from 'react-icons/fi';
import Header from '../components/Header.jsx';
import Loader from '../components/Loader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ContactButtons from '../components/ContactButtons.jsx';
import api from '../api.js';
import SafeImage from '../components/SafeImage.jsx';
import { formatPrice, resolveImageUrl } from '../utils/categories.js';
import { canonicalUrl, DEFAULT_OG_IMAGE } from '../utils/seo.js';

// One spec row helper — skips rendering entirely when the value is empty,
// so categories that don't have a field (e.g. bedrooms for Land) never
// show a blank row.
function Spec({ label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex justify-between py-2 border-b border-brand/10 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-ink">{value}</span>
    </div>
  );
}

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/properties/${id}`)
      .then(({ data }) => setProperty(data.property))
      .catch(() => setProperty(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="app-shell">
        <Header title="Property Details" showSearch={false} />
        <Loader label="Loading property details..." />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="app-shell">
        <Header title="Property Details" showSearch={false} />
        <EmptyState title="Property not found" subtitle="It may have been removed by the admin." />
      </div>
    );
  }

  const isRent = property.category === 'rent';
  const images = property.images?.length ? property.images : [{ url: null }];

  // "Lease Amount" renamed to "Rent Amount" for the Rent category (spec item a).
  const priceLabel = isRent ? 'Rent Amount' : property.category === 'lease' ? 'Lease Amount' : 'Price';
  const priceValue = `${formatPrice(property.price)}${property.priceUnit || ''}`;
  const description = property.description?.slice(0, 150) || property.title;
  const ogImage = images[0]?.url ? resolveImageUrl(images[0].url, 800) : DEFAULT_OG_IMAGE;

  return (
    <div className="app-shell">
      <Helmet>
        <title>{property.title} | PMV Properties</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonicalUrl(`/property/${id}`)} />
        <meta property="og:title" content={`${property.title} | PMV Properties`} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={canonicalUrl(`/property/${id}`)} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="product" />
      </Helmet>

      <Header title="Property Details" showSearch={false} />

      <div className="page-scroll page-fade">
        {/* Image gallery */}
        <div className="relative h-56 w-full bg-brand-50">
          <SafeImage
            src={images[activeImg]?.url}
            alt={property.title}
            width={1000}
            className="h-full w-full object-cover"
          />
          <span className="absolute top-3 right-3 bg-accent text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow">
            For {property.listingType}
          </span>
          {images.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-1.5 h-1.5 rounded-full ${i === activeImg ? 'bg-white' : 'bg-white/50'}`}
                  aria-label={`Show image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 px-4 py-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className={`tap-scale shrink-0 w-16 h-14 rounded-lg overflow-hidden border-2 ${
                  i === activeImg ? 'border-brand' : 'border-transparent'
                }`}
              >
                <SafeImage src={img.url} alt="" width={200} loading="lazy" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="px-4 pt-2 pb-4">
          <h2 className="font-bold text-lg text-ink">{property.title}</h2>
          <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
            <FiMapPin size={14} className="text-accent" /> {property.location}
          </p>
          <p className="text-brand font-extrabold text-2xl mt-2">{priceValue}</p>

          <div className="mt-4 bg-brand-50/70 rounded-xl2 p-4">
            <p className="text-sm font-semibold text-ink mb-1">Property Details</p>
            <Spec label="Property Type" value={property.propertyType} />
            <Spec label={isRent ? 'Rent Amount' : priceLabel} value={priceValue} />
            <Spec label="Built-up Area" value={property.area ? `${property.area} ${property.areaUnit}` : null} />
            <Spec label="Bedrooms" value={property.bedrooms} />
            <Spec label="Bathrooms" value={property.bathrooms} />
            <Spec label="Floor" value={property.floor} />
            <Spec label="Parking" value={property.parkingAvailable ? 'Available' : null} />
            <Spec label="Water Supply" value={property.waterSupply ? 'Available' : null} />

            {/* Facing + Lease Duration are intentionally hidden for the Rent
                category — removed per spec items (b) and (c). Loan Available
                is not part of this schema at all — removed per spec (Buy/Sale). */}
            {!isRent && <Spec label="Facing" value={property.facing} />}
            {property.category === 'lease' && <Spec label="Lease Duration" value={property.leaseDuration} />}
            <Spec label="Available From" value={property.availableFrom} />
          </div>

          {property.description && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-ink mb-1">Description</p>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

        </div>
      </div>

      {/* Sticky Call | WhatsApp bar (the old "Contact for Details" button stays removed). */}
      <ContactButtons propertyTitle={property.title} propertyId={property._id} priceText={priceValue} />
    </div>
  );
}
