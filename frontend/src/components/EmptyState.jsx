import React from 'react';
import { FiInbox } from 'react-icons/fi';

export default function EmptyState({ title = 'Nothing here yet', subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400 px-6 text-center">
      <FiInbox size={36} />
      <p className="font-medium text-gray-500">{title}</p>
      {subtitle && <p className="text-xs">{subtitle}</p>}
    </div>
  );
}
