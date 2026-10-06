import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SplashGate from './components/SplashGate.jsx';
import ServerWakeNotice from './components/ServerWakeNotice.jsx';
import Home from './pages/Home.jsx';
import AllProperties from './pages/AllProperties.jsx';
import CategoryListing from './pages/CategoryListing.jsx';
import PropertyDetails from './pages/PropertyDetails.jsx';
import EnquiryForm from './pages/EnquiryForm.jsx';

import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProperties from './pages/admin/AdminProperties.jsx';
import AdminAddEditProperty from './pages/admin/AdminAddEditProperty.jsx';
import AdminEnquiries from './pages/admin/AdminEnquiries.jsx';

export default function App() {
  return (
    <>
    <SplashGate />
    <ServerWakeNotice />
    <Routes>
      {/* Customer side (mobile-first) */}
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/properties" element={<AllProperties />} />
      <Route path="/category/:slug" element={<CategoryListing />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/post-property" element={<EnquiryForm type="post-property" title="Post your Property" />} />
      <Route path="/need-property" element={<EnquiryForm type="need-property" title="I need a Property" />} />

      {/* Admin panel (web dashboard, no customer login exists) */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/properties" element={<AdminProperties />} />
      <Route path="/admin/properties/new" element={<AdminAddEditProperty />} />
      <Route path="/admin/properties/:id/edit" element={<AdminAddEditProperty />} />
      <Route path="/admin/enquiries" element={<AdminEnquiries />} />
    </Routes>
    </>
  );
}
