import React from 'react';
import { useNavigate } from 'react-router-dom';

const NavCard = ({ title, desc, icon: Icon, to, className }) => {
  const navigate = useNavigate();

  // If no specific mc-button class is passed, default to the standard stone button
  const buttonClass = className || "mc-button";

  return (
    <div 
      onClick={() => navigate(to)}
      className={`${buttonClass} flex flex-col items-center text-center justify-center gap-4 h-full min-h-[180px] group`}
    >
      {/* Icon Slot - Styled like an inventory square */}
      <div className="mc-slot p-4 bg-black/20 group-hover:bg-black/10 transition-colors">
        <Icon 
          size={40} 
          className="text-white drop-shadow-[2px_2px_0px_rgba(0,0,0,0.5)]" 
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-lg font-bold uppercase tracking-wide">
          {title}
        </h3>
        <p className="text-xs opacity-80 font-medium normal-case tracking-normal">
          {desc}
        </p>
      </div>
    </div>
  );
};

export default NavCard;