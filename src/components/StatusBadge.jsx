import React from 'react';

/**
 * Displays a colour-coded compliance badge.
 * Accepts both the backend values ('compliant' / 'risk') and any legacy
 * capitalised variants ('Safe' / 'Risk') so existing call-sites stay valid.
 */
const StatusBadge = ({ status }) => {
  const isSafe =
    status === 'compliant' ||
    status === 'Safe'      ||
    status === 'safe';

  const label = isSafe ? 'Compliant' : 'Non-Compliant';

  return (
    <span
      className={`
        inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm
        ${isSafe
          ? 'bg-green-100 text-green-800 border border-green-200'
          : 'bg-red-100  text-red-800  border border-red-200'}
      `}
    >
      <span
        className={`w-2 h-2 mr-2 rounded-full ${isSafe ? 'bg-green-600' : 'bg-red-600'}`}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
