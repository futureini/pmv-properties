import React from 'react';
import { FiPhoneCall } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import api, { ADMIN_CONTACT_NUMBER } from '../api.js';

/**
 * Every Call / WhatsApp tap — from any property, any category — routes to
 * PMV Properties' own admin number. The property owner's number is never
 * shown to customers; admin is always the intermediary (per spec).
 *
 * Each tap is also counted against the property (fire-and-forget, never blocks
 * the call / chat) so the admin can see which listings get real interest even
 * when the customer never fills a form. See Admin -> Properties.
 */
function logClick(propertyId, type) {
  if (!propertyId) return;
  api.post(`/properties/${propertyId}/contact-click`, { type }).catch(() => {});
}

function whatsappLink(text) {
  return `https://wa.me/${ADMIN_CONTACT_NUMBER}?text=${encodeURIComponent(text)}`;
}

/**
 * Sticky Call | WhatsApp bar pinned to the bottom of the Property Details page.
 * Stays visible while the customer scrolls the photos and details.
 */
export default function ContactButtons({ propertyTitle = 'this property', propertyId, priceText }) {
  const message = `Hi PMV Properties, I'm interested in ${propertyTitle}${
    priceText ? ` (${priceText})` : ''
  }. Please share more details.`;

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 mx-auto w-full max-w-app bg-white border-t border-brand/10 shadow-[0_-6px_18px_rgba(10,61,20,0.08)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="grid grid-cols-2 gap-3">
        <a
          href={`tel:+${ADMIN_CONTACT_NUMBER}`}
          onClick={() => logClick(propertyId, 'call')}
          className="tap-scale flex h-12 items-center justify-center gap-2 rounded-xl bg-brand text-white font-semibold shadow-card"
        >
          <FiPhoneCall size={18} /> Call
        </a>
        <a
          href={whatsappLink(message)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => logClick(propertyId, 'whatsapp')}
          className="tap-scale flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-accent bg-accent text-white font-semibold"
        >
          <FaWhatsapp size={20} className="text-white" /> WhatsApp
        </a>
      </div>
    </div>
  );
}

/** Small Call icon for the Home header — for visitors who just want to ring us. */
export function HeaderCall() {
  return (
    <a
      href={`tel:+${ADMIN_CONTACT_NUMBER}`}
      onClick={() => logClick(null, 'call')}
      aria-label="Call PMV Properties"
      className="tap-scale flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white shadow-card"
    >
      <FiPhoneCall size={20} />
    </a>
  );
}
