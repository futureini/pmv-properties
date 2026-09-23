import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '../components/Header.jsx';
import BottomNav from '../components/BottomNav.jsx';
import api from '../api.js';

/**
 * Shared form for the two customer-facing lead flows from the Home page:
 * "Post your Property" and "I need a Property". Both simply create an
 * Enquiry that the admin follows up on (no self-service listing creation,
 * per spec — only admin publishes properties).
 */
export default function EnquiryForm({ type, title }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await api.post('/enquiries', { ...form, type });
      setStatus('done');
      setForm({ name: '', phone: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="app-shell">
      <Helmet>
        <title>{title} | PMV Properties</title>
      </Helmet>
      <Header title={title} showSearch={false} />

      <div className="page-scroll page-fade px-4 pt-4">
        {status === 'done' ? (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl2 p-4 text-center">
            Thanks! Our team will contact you shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Your Name" name="name" value={form.name} onChange={handleChange} required />
            <Field label="Phone Number" name="phone" value={form.phone} onChange={handleChange} required type="tel" />
            <Field label="Email (optional)" name="email" value={form.email} onChange={handleChange} type="email" />
            <div>
              <label className="text-xs font-medium text-gray-600">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                rows={4}
                placeholder={
                  type === 'post-property'
                    ? 'Tell us about your property — type, location, size, expected price...'
                    : 'Tell us what kind of property you are looking for...'
                }
                className="mt-1 w-full text-sm border border-gray-200 rounded-xl p-3 outline-none focus:border-brand"
              />
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="tap-scale w-full bg-brand text-white font-semibold py-3 rounded-xl2 shadow-card disabled:opacity-60"
            >
              {status === 'sending' ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        )}
      </div>

      <BottomNav />
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <input
        {...props}
        className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand"
      />
    </div>
  );
}
