import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiHome, FiCheckCircle, FiEye, FiPlusCircle, FiList, FiSettings } from 'react-icons/fi';
import AdminLayout from './AdminLayout.jsx';
import Loader from '../../components/Loader.jsx';
import api from '../../api.js';
import SafeImage from '../../components/SafeImage.jsx';
import { formatPrice } from '../../utils/categories.js';

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white rounded-xl2 shadow-card p-4 flex items-center gap-3">
      <span className="w-11 h-11 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
        <Icon size={20} />
      </span>
      <div>
        <p className="text-xl font-bold text-ink leading-tight">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/properties/admin/stats')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <Helmet>
        <title>Dashboard | PMV Properties Admin</title>
      </Helmet>
      <h1 className="text-lg font-bold text-ink mb-4">Dashboard</h1>

      {loading || !stats ? (
        <Loader label="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <StatCard icon={FiHome} label="Total Properties" value={stats.totalProperties} />
            <StatCard icon={FiCheckCircle} label="Active Listings" value={stats.activeListings} />
            <StatCard icon={FiEye} label="Total Property Views" value={stats.totalViews} />
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-5">
            <div className="md:col-span-2 bg-white rounded-xl2 shadow-card p-4">
              <p className="font-semibold text-sm text-ink mb-3">Recent Listings</p>
              {stats.recent.length === 0 ? (
                <p className="text-xs text-gray-400 py-4 text-center">No properties added yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recent.map((p) => (
                    <Link
                      key={p._id}
                      to={`/admin/properties/${p._id}/edit`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <SafeImage
                        src={p.images?.[0]?.url}
                        alt=""
                        width={200}
                        className="w-12 h-10 rounded-md object-cover bg-brand-50"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink truncate">{p.title}</p>
                        <p className="text-xs text-gray-500">{p.location}</p>
                      </div>
                      <p className="text-sm font-semibold text-brand shrink-0">{formatPrice(p.price)}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl2 shadow-card p-4 space-y-2">
              <p className="font-semibold text-sm text-ink mb-2">Quick Actions</p>
              <Link
                to="/admin/properties/new"
                className="tap-scale flex items-center gap-2 text-sm font-medium text-brand bg-brand/5 px-3 py-2.5 rounded-lg"
              >
                <FiPlusCircle size={16} /> Add Property
              </Link>
              <Link
                to="/admin/properties"
                className="tap-scale flex items-center gap-2 text-sm font-medium text-ink bg-gray-50 px-3 py-2.5 rounded-lg"
              >
                <FiList size={16} /> Manage Listings
              </Link>
              <Link
                to="/admin/enquiries"
                className="tap-scale flex items-center gap-2 text-sm font-medium text-ink bg-gray-50 px-3 py-2.5 rounded-lg"
              >
                <FiSettings size={16} /> View Enquiries
              </Link>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
