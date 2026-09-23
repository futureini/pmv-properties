import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';

/**
 * Shared top bar used on every inner screen (listing pages, details pages).
 * Logo-green bar + back arrow + title.
 */
export default function Header({ title, onSearchClick, showSearch = true, subtitle }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-20 bg-brand text-white px-4 py-3 flex items-center gap-3 shadow-md">
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="tap-scale p-1 -ml-1 rounded-full hover:bg-white/10"
      >
        <FiArrowLeft size={22} />
      </button>
      <div className="flex-1 min-w-0">
        <h1 className="font-semibold text-base leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-[11px] text-white/80 truncate">{subtitle}</p>}
      </div>
      {showSearch && (
        <button
          onClick={onSearchClick}
          aria-label="Search"
          className="tap-scale p-1 rounded-full hover:bg-white/10"
        >
          <FiSearch size={20} />
        </button>
      )}
    </header>
  );
}
