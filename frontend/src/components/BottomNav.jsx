import React from 'react';
import { NavLink } from 'react-router-dom';
import iconHome from '../assets/icons/nav/nav-home.png';
import iconProperties from '../assets/icons/nav/nav-properties.png';
import iconPostProperty from '../assets/icons/nav/nav-post-property.png';
import iconEnquiry from '../assets/icons/nav/nav-enquiry.png';
import iconAdmin from '../assets/icons/nav/nav-admin.png';

const items = [
  { to: '/home', label: 'Home', icon: iconHome, end: true },
  { to: '/properties', label: 'Properties', icon: iconProperties },
  { to: '/post-property', label: 'Post Property', icon: iconPostProperty },
  { to: '/need-property', label: 'Enquiry', icon: iconEnquiry },
  { to: '/admin/login', label: 'Admin', icon: iconAdmin },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-app bg-white border-t border-gray-200 flex justify-between px-1 py-1.5 z-30">
      {items.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `tap-scale flex flex-col items-center gap-0.5 px-1 py-1 rounded-lg flex-1 text-[9.5px] min-[380px]:text-[10px] font-medium min-w-0 ${
              isActive ? 'text-brand' : 'text-gray-500'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <img
                src={icon}
                alt=""
                aria-hidden="true"
                className={`w-5 h-5 min-[380px]:w-[22px] min-[380px]:h-[22px] object-contain transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-70'
                }`}
                width="22"
                height="22"
              />
              <span className="truncate w-full text-center">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
