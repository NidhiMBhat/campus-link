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
    // Full Screen Overlay
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-300 font-mono">
      
      {/* Modal Container (The Book GUI) */}
      <div className={`relative w-full max-w-lg bg-[#C6C6C6] border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] ${shake ? 'animate-shake' : ''}`}>
        
        {/* Inner Padding for GUI look */}
        <div className="p-2 border-2 border-[#555] bg-[#C6C6C6] shadow-[inset_2px_2px_0px_#FFF,inset_-2px_-2px_0px_#555] h-full flex flex-col">

            {/* Header */}
            <div className="p-4 bg-[#C6C6C6] border-b-2 border-[#999] flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#8B8B8B] border-2 border-black shadow-[inset_2px_2px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
                <BookOpen size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#333] uppercase tracking-wide [text-shadow:1px_1px_#FFF]">
                Server Rulebook
            </h2>
            </div>

            {/* Scrollable Rules Content (The Paper Page) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 bg-[#e3dcb2] border-2 border-black shadow-[inset_3px_3px_0px_#d4cba0,inset_-2px_-2px_0px_#8f865d] relative mx-2 mb-2">
            
            <p className="text-[#3d3326] font-bold text-sm mb-6 leading-relaxed">
                Welcome to <span className="text-[#A32222]">CampusLink</span>! To ensure a safe and helpful environment for everyone, you must agree to the following rules:
            </p>

            <div className="space-y-4">
                <RuleItem 
                icon={<Shield className="text-[#333]" size={18} />} 
                title="Honesty is Key" 
                desc="Do not make fake requests or accept tasks you cannot fulfill." 
                />
                <RuleItem 
                icon={<AlertTriangle className="text-[#A32222]" size={18} />} 
                title="Prohibited Items" 
                desc="Tasks involving money handling or prohibited items are restricted. Delivery of such items will result in an immediate ban." 
                />
                <RuleItem 
                icon={<Check className="text-[#3c8527]" size={18} />} 
                title="Respect & Safety" 
                desc="Treat peers with respect. Harassment or abuse of any kind will be reported to college authorities." 
                />
                <RuleItem 
                icon={<Check className="text-[#3c8527]" size={18} />} 
                title="Payment Transparency" 
                desc="All transactions are credit-based. Do not ask for or offer real money outside the app logic." 
                />
            </div>
            </div>

            {/* Footer with Agreement */}
            <div className="p-4 bg-[#C6C6C6] mt-auto">
            
            <label className="flex items-start gap-3 cursor-pointer group mb-6 select-none bg-[#D6D6D6] p-3 border-2 border-[#999] active:bg-[#BBB]">
                <div className="relative flex items-center mt-1">
                <input 
                    type="checkbox" 
                    className="peer sr-only" 
                    checked={isChecked} 
                    onChange={(e) => setIsChecked(e.target.checked)} 
                />
                {/* Custom Minecraft Checkbox */}
                <div className="w-6 h-6 bg-[#333] border-2 border-[#AAA] shadow-[inset_2px_2px_0px_#000] peer-checked:bg-[#333]"></div>
                
                {/* The Checkmark */}
                {isChecked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-2 h-2 bg-[#3c8527] shadow-[0_0_5px_#39ff14]"></div> 
                        {/* Simulating a "Redstone Lamp" activation dot instead of a checkmark for MC feel, or use icon */}
                        <Check size={16} className="absolute text-white" strokeWidth={4} />
                    </div>
                )}
                </div>
                <p className="text-xs font-bold text-[#333] leading-tight pt-1">
                I agree to all terms. I understand that I shall be <span className="text-[#A32222] border-b-2 border-[#A32222]">banned from the server</span> if found disobeying these rules.
                </p>
            </label>

            <button
                onClick={handleContinue}
                className={`w-full py-3 px-6 font-bold uppercase tracking-wider text-white border-4 border-black shadow-[inset_4px_4px_0px_0px_rgba(255,255,255,0.2),inset_-4px_-4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all
                ${isChecked 
                    ? 'bg-[#3c8527] hover:bg-[#4ca633] text-shadow-[2px_2px_#000]' 
                    : 'bg-[#555] text-gray-400 cursor-not-allowed'
                }`}
            >
                {isChecked ? "Accept & Join World" : "Read & Agree to Continue"}
            </button>
            
            {!isChecked && shake && (
                <p className="text-[#A32222] font-bold text-xs text-center mt-3 uppercase tracking-wide bg-[#FFAAAA] border border-[#A32222] p-1 inline-block w-full">
                   ⚠ You must agree to the rules.
                </p>
            )}
            </div>
        
        </div>
      </div>
    </div>
  );
};

// Simple helper for list items
const RuleItem = ({ icon, title, desc }) => (
  <div className="flex gap-3 mb-2">
    <div className="mt-0.5 min-w-[20px]">{icon}</div>
    <div>
      <h4 className="text-[#3d3326] font-bold text-sm uppercase">{title}</h4>
      <p className="text-[#5c4d3c] text-xs font-bold leading-tight border-b border-[#c2b59b] pb-2 mb-2">{desc}</p>
    </div>
  </div>
);

export default RuleBookModal;