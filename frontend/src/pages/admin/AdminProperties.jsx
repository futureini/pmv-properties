import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiPlusCircle, FiEdit2, FiTrash2, FiSearch, FiPhoneCall } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import AdminLayout from './AdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import api from '../../api.js';
import SafeImage from '../../components/SafeImage.jsx';
import { CATEGORIES, formatPrice } from '../../utils/categories.js';

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/properties/admin/all', { params: { category, status, q } })
      .then(({ data }) => setProperties(data.properties))
      .finally(() => setLoading(false));
  };

  useEffect(load, [category, status, q]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this property permanently?')) return;
    await api.delete(`/properties/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Property Listing Management | PMV Properties Admin</title>
      </Helmet>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-ink">Property Listing Management</h1>
        <Link
          to="/admin/properties/new"
          className="tap-scale flex items-center gap-2 bg-brand text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-card"
        >
          <FiPlusCircle size={16} /> Add Property
        </Link>
      </div>

      <div className="bg-white rounded-xl2 shadow-card p-3 mb-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2 flex-1 min-w-[180px]">
          <FiSearch size={15} className="text-gray-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by location, title..."
            className="bg-transparent text-sm outline-none flex-1"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-2"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-2"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl2 shadow-card overflow-x-auto">
        {loading ? (
          <Loader />
        ) : properties.length === 0 ? (
          <EmptyState title="No properties found" />
        ) : (
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 font-medium">Property</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Price</th>
                <th className="py-3 px-4 font-medium" title="Times customers tapped Call / WhatsApp on this property">
                  Call / WhatsApp taps
                </th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-4 flex items-center gap-3">
                    <SafeImage
                      src={p.images?.[0]?.url}
                      alt=""
                      width={200}
                      className="w-12 h-10 rounded-md object-cover bg-brand-50"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ink truncate max-w-[160px]">{p.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-[160px]">{p.location}</p>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 capitalize">{p.category.replace('-', ' / ')}</td>
                  <td className="py-2.5 px-4 font-medium text-brand">{formatPrice(p.price)}</td>
                  <td className="py-2.5 px-4">
                    <span className="inline-flex items-center gap-3 text-xs text-gray-600">
                      <span className="inline-flex items-center gap-1" title="Call taps">
                        <FiPhoneCall size={13} className="text-brand" /> {p.callClicks || 0}
                      </span>
                      <span className="inline-flex items-center gap-1" title="WhatsApp taps">
                        <FaWhatsapp size={14} className="text-[#25D366]" /> {p.whatsappClicks || 0}
                      </span>
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        p.status === 'Active' ? 'bg-brand-100 text-brand-dark' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/admin/properties/${p._id}/edit`} className="text-brand" aria-label="Edit">
                        <FiEdit2 size={16} />
                      </Link>
                      <button onClick={() => handleDelete(p._id)} className="text-red-500" aria-label="Delete">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}
