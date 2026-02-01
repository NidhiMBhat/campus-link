import React from 'react';

const PixelBadge = ({ label = '', color = 'var(--pastel-mint)', className = '' }) => {
  return (
    <div
      role="img"
      aria-label={label}
      className={`badge ${className}`}
      style={{ background: color, color: 'var(--soft-ink)' }}
    >
      <span style={{ fontSize: 10, fontWeight: 700 }}>{label}</span>
    </div>
  );
};

export default PixelBadge;
