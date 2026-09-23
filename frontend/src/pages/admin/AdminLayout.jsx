import React from 'react';
import { NavLink, useNavigate, Navigate } from 'react-router-dom';
import { FiGrid, FiHome, FiPlusCircle, FiMessageSquare, FiLogOut, FiMenu } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import logo from '../../assets/logo-sm.webp';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/admin/properties', label: 'Properties', icon: FiHome },
  { to: '/admin/properties/new', label: 'Add Property', icon: FiPlusCircle },
  { to: '/admin/enquiries', label: 'Enquiries', icon: FiMessageSquare },
];

export default function AdminLayout({ children }) {
  const { isAuthenticated, logout, admin } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#F1F5EF] flex">
      {/* Sidebar */}
      <aside
        className={`fixed md:static z-30 inset-y-0 left-0 w-60 bg-brand-deep text-white transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="px-5 py-5 flex items-center gap-2 border-b border-white/10">
          <div className="bg-white rounded-lg px-2 py-1.5">
            <img src={logo} alt="PMV Properties" width="120" height="55" className="h-8 w-auto" />
          </div>
          <p className="text-[10px] text-white/50">Admin Panel</p>
        </div>
        <nav className="px-3 py-4 space-y-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white text-brand-dark' : 'text-white/75 hover:bg-white/10'
                }`
              }
            >
              <Icon size={17} /> {label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/70 hover:bg-white/10 mt-4"
          >
            <FiLogOut size={17} /> Logout
          </button>
        </nav>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <FiMenu size={22} />
          </button>
          <p className="font-semibold text-ink text-sm">PMV Properties Admin</p>
        </header>
        <div className="hidden md:flex justify-end items-center px-6 py-3 bg-white border-b border-gray-200">
          <p className="text-sm text-gray-500">
            Signed in as <span className="font-medium text-ink">{admin?.name || admin?.email}</span>
          </p>
        </div>
        <main className="p-4 md:p-6 page-fade">{children}</main>
      </div>
    </div>
  );
}
