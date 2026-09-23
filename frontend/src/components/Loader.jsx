import React from 'react';

export default function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <div className="w-9 h-9 border-4 border-brand/20 border-t-brand rounded-full animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
