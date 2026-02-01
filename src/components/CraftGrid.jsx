import React from 'react';

const CraftGrid = ({ items = [] }) => {
  const cells = Array.from({ length: 9 }).map((_, i) => items[i] || null);
  return (
    <div className="grid grid-cols-3 gap-1">
      {cells.map((cell, idx) => (
        <div key={idx} className="icon-surface w-16 h-16" aria-label={`grid-cell-${idx}`}>
          {cell}
        </div>
      ))}
    </div>
  );
};

export default CraftGrid;
