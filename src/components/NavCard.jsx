import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavCard = ({ title, desc, icon: Icon, to, color }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(to)}
      className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700 
                 cursor-pointer hover:bg-gray-750 hover:scale-[1.02] transition-all duration-200
                 flex flex-col items-center text-center justify-center gap-3 h-full"
    >
      <div className={`p-4 rounded-full bg-opacity-20 ${color}`}>
        <Icon size={32} className={color.replace('bg-', 'text-')} />
      </div>
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="text-sm text-gray-400">{desc}</p>
    </div>
  );
};

export default NavCard;