import React, { useState } from 'react';
import { Shield, AlertTriangle, Check, BookOpen } from 'lucide-react';

const RuleBookModal = ({ onAccept }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [shake, setShake] = useState(false);

  const handleContinue = () => {
    if (!isChecked) {
      // Trigger shake animation and warning
      setShake(true);
      setTimeout(() => setShake(false), 500); // Reset shake after 500ms
      return;
    }
    onAccept();
  };

  return (
    // Full Screen Overlay with Blur
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300">
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-lg bg-gray-900 border border-indigo-500/30 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${shake ? 'animate-shake' : ''}`}>
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-900/50 to-gray-900 border-b border-white/10 flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Community Rulebook</h2>
        </div>

        {/* Scrollable Rules Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
          <p className="text-gray-400 text-sm mb-4">
            Welcome to CampusLink! To ensure a safe and helpful environment for everyone, you must agree to the following rules:
          </p>

          <div className="space-y-3">
            <RuleItem 
              icon={<Shield className="text-emerald-400" size={18} />} 
              title="Honesty is Key" 
              desc="Do not make fake requests or accept tasks you cannot fulfill." 
            />
            <RuleItem 
              icon={<AlertTriangle className="text-orange-400" size={18} />} 
              title="Prohibited Items" 
              desc="Tasks involving money handling or prohibited items are restricted. Delivery of such items will result in an immediate ban." 
            />
            <RuleItem 
              icon={<Check className="text-blue-400" size={18} />} 
              title="Respect & Safety" 
              desc="Treat peers with respect. Harassment or abuse of any kind will be reported to college authorities." 
            />
             <RuleItem 
              icon={<Check className="text-purple-400" size={18} />} 
              title="Payment Transparency" 
              desc="All transactions are credit-based. Do not ask for or offer real money outside the app logic." 
            />
          </div>
        </div>

        {/* Footer with Agreement */}
        <div className="p-6 bg-gray-800/50 border-t border-white/5">
          
          <label className="flex items-start gap-3 cursor-pointer group mb-6 select-none">
            <div className="relative flex items-center mt-1">
              <input 
                type="checkbox" 
                className="peer sr-only" 
                checked={isChecked} 
                onChange={(e) => setIsChecked(e.target.checked)} 
              />
              <div className="w-5 h-5 border-2 border-gray-500 rounded peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-all"></div>
              <Check size={14} className="absolute text-white opacity-0 peer-checked:opacity-100 left-0.5 top-0.5 pointer-events-none" />
            </div>
            <p className="text-sm text-gray-300 group-hover:text-white transition-colors">
              I agree to all the terms and rules mentioned above. I understand that I shall be <span className="text-red-400 font-bold">removed from the system</span> if found disobeying these rules.
            </p>
          </label>

          <button
            onClick={handleContinue}
            className={`w-full py-3.5 rounded-xl font-bold transition-all duration-300 transform active:scale-95 ${
              isChecked 
                ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isChecked ? "Accept & Continue" : "Read & Agree to Continue"}
          </button>
          
          {!isChecked && shake && (
             <p className="text-red-400 text-xs text-center mt-3 animate-pulse">
               ⚠️ You must agree to the rules to access CampusLink.
             </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Simple helper for list items
const RuleItem = ({ icon, title, desc }) => (
  <div className="flex gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
    <div className="mt-0.5">{icon}</div>
    <div>
      <h4 className="text-white font-medium text-sm">{title}</h4>
      <p className="text-gray-400 text-xs leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default RuleBookModal;