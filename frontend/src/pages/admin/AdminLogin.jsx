import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/logo.webp';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5EF] flex items-center justify-center px-4">
      <Helmet>
        <title>Admin Login | PMV Properties</title>
      </Helmet>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-card p-8">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="PMV Properties" width="800" height="364" className="h-20 w-auto" />
          <p className="text-xs text-gray-500 mt-2">Admin Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600">Username</label>
            <input
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              placeholder="Username"
              required
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value })}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="mt-1 w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-brand"
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="tap-scale w-full bg-brand text-white font-semibold py-3 rounded-xl2 shadow-card disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
