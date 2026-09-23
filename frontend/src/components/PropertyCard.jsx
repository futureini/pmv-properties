import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin } from 'react-icons/fi';
import SafeImage from './SafeImage.jsx';
import { formatPrice } from '../utils/categories.js';

export default function PropertyCard({ property }) {
  const navigate = useNavigate();
  const cover = property.images?.[0]?.url;
  const priceLabel = `${formatPrice(property.price)}${property.priceUnit || ''}`;

  return (
    <button
      onClick={() => navigate(`/property/${property._id}`)}
      className="tap-scale text-left w-full bg-white rounded-xl2 shadow-card overflow-hidden border border-brand/10"
    >
      <div className="relative h-36 w-full bg-brand-50">
        <SafeImage
          src={cover}
          alt={property.title}
          width={600}
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <span className="absolute top-2 right-2 bg-accent text-white text-[10px] font-semibold px-2 py-1 rounded-full shadow">
          For {property.listingType}
        </span>
      </div>
      <div className="p-3">
        <p className="font-semibold text-sm text-ink truncate">{property.title}</p>
        <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5 truncate">
          <FiMapPin size={12} className="text-accent shrink-0" /> {property.location}
        </p>
        <p className="text-brand font-bold text-sm mt-1">{priceLabel}</p>
      </div>
    </button>
  );
}
