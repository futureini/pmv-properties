import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiTrash2 } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import api from '../../api.js';

const TYPE_LABEL = {
  'property-enquiry': 'Property Enquiry',
  'post-property': 'Post Property',
  'need-property': 'Need Property',
};

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/enquiries', { params: { status } })
      .then(({ data }) => setEnquiries(data.enquiries))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const updateStatus = async (id, newStatus) => {
    await api.put(`/enquiries/${id}`, { status: newStatus });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    await api.delete(`/enquiries/${id}`);
    load();
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Enquiries | PMV Properties Admin</title>
      </Helmet>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-ink">Enquiries</h1>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-2 py-2"
        >
          <option value="">All Status</option>
          <option value="New">New</option>
          <option value="Contacted">Contacted</option>
          <option value="Closed">Closed</option>
        </select>
      </div>

      <div className="bg-white rounded-xl2 shadow-card overflow-x-auto">
        {loading ? (
          <Loader />
        ) : enquiries.length === 0 ? (
          <EmptyState title="No enquiries yet" />
        ) : (
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Phone</th>
                <th className="py-3 px-4 font-medium">Type</th>
                <th className="py-3 px-4 font-medium">Property</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((e) => (
                <tr key={e._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-2.5 px-4 font-medium text-ink">{e.name}</td>
                  <td className="py-2.5 px-4">
                    <a href={`tel:${e.phone}`} className="text-brand">{e.phone}</a>
                  </td>
                  <td className="py-2.5 px-4">{TYPE_LABEL[e.type] || e.type}</td>
                  <td className="py-2.5 px-4 truncate max-w-[160px]">{e.property?.title || '—'}</td>
                  <td className="py-2.5 px-4">
                    <select
                      value={e.status}
                      onChange={(ev) => updateStatus(e._id, ev.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1"
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Closed</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-4">
                    <button onClick={() => remove(e._id)} className="text-red-500" aria-label="Delete">
                      <FiTrash2 size={16} />
                    </button>
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
