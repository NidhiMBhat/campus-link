import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, LogOut, Mail, Phone, Shield } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, query, where, getCountFromServer } from 'firebase/firestore';

const Profile = () => {
  const navigate = useNavigate();
  const { user: authUser, logout } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ requested: 0, helped: 0 });

  useEffect(() => {
    if (!authUser) return;

    // 1. Listen to User Profile for Credits
    const unsubProfile = onSnapshot(doc(db, "users", authUser.uid), (doc) => {
      if (doc.exists()) setProfileData(doc.data());
    });

    // 2. Fetch Counts
    const fetchCounts = async () => {
      const requestsRef = collection(db, "requests");
      const qRequested = query(requestsRef, where("requesterId", "==", authUser.uid));
      const requestedSnap = await getCountFromServer(qRequested);

      const qHelped = query(
        requestsRef, 
        where("helperId", "==", authUser.uid),
        where("status", "==", "Completed")
      );
      const helpedSnap = await getCountFromServer(qHelped);

      setStats({
        requested: requestedSnap.data().count,
        helped: helpedSnap.data().count
      });
    };

    fetchCounts();
    return () => unsubProfile();
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) { console.error(err); }
  };

  if (!profileData) return (
    <div className="app-canvas min-h-screen flex items-center justify-center text-black font-black uppercase tracking-widest">
        Loading Profile...
    </div>
  );

  return (
    // MAIN CONTAINER: Matte Campus Background
    <div className="app-canvas min-h-screen w-full font-mono">
      
      <div className="p-6 max-w-2xl mx-auto flex flex-col">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="mb-8 flex items-center text-[#3C4142] hover:text-black transition group w-fit"
        >
          <div className="bg-[#CBD5E1] p-1 border-2 border-[#3C4142] group-active:translate-y-1 mr-2 shadow-[2px_2px_0px_0px_#3C4142]">
             <ArrowLeft size={20} />
          </div>
          <span className="uppercase font-black tracking-widest text-xs">Back to Menu</span>
        </button>

        {/* Title */}
        <div className="mb-6 text-center">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">
                My Profile
            </h1>
        </div>

        {/* === MAIN PROFILE PANEL === */}
        <div className="mc-panel shadow-[4px_4px_0px_0px_#3C4142]">
            <div className="p-4 sm:p-6">
                
                {/* --- IDENTITY CARD SECTION (The "Book" Look) --- */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    
                    {/* LEFT: Avatar Frame */}
                    <div className="flex flex-col items-center justify-center">
                        {/* Avatar Frame */}
                        <div className="w-32 h-32 bg-[#e0beb3] border-4 border-[#3C4142] flex items-center justify-center shadow-[4px_4px_0px_0px_#3C4142] relative">
                            {/* Inner Slot */}
                            <div className="w-24 h-24 bg-white border-2 border-[#3C4142] flex items-center justify-center">
                                <UserCircle size={88} className="text-[#3C4142]" />
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Info Block */}
                    <div className="flex-1 bg-white border-4 border-[#3C4142] p-4 shadow-[2px_2px_0px_0px_#3C4142] relative overflow-hidden flex flex-col justify-center">
                        
                        {/* Name Header */}
                        <div className="border-b-2 border-[#3C4142] pb-2 mb-3">
                            <h2 className="text-2xl font-black text-black uppercase tracking-wide leading-none">
                                {profileData.fullName}
                            </h2>
                            <span className="text-[10px] text-[#3C4142] font-extrabold uppercase tracking-widest">
                                Student | RVCE
                            </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-[#e0beb3]" />
                                <div>
                                    <p className="text-[10px] text-[#3C4142] font-extrabold uppercase">Email</p>
                                    <p className="text-sm font-black text-black break-all">{profileData.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-[#e0beb3]" />
                                <div>
                                    <p className="text-[10px] text-[#3C4142] font-extrabold uppercase">Phone</p>
                                    <p className="text-sm font-black text-black">{profileData.phone || "Not Provided"}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative */}
                        <div className="absolute -bottom-4 -right-4 opacity-10 rotate-[-15deg]">
                            <Shield size={80} className="text-[#3C4142]" />
                        </div>
                    </div>
                </div>

                {/* --- STATS SECTION --- */}
                <div className="bg-[#CBD5E1] p-3 border-4 border-[#3C4142] shadow-[2px_2px_0px_0px_#3C4142] mb-6">
                    <p className="text-black text-xs font-black mb-2 uppercase tracking-wide">
                        Statistics
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Credits', val: profileData.credits, color: 'text-[#e0beb3]', icon: '🪙' },
                            { label: 'Requests', val: stats.requested, color: 'text-[#e0beb3]', icon: '📜' },
                            { label: 'Helped', val: stats.helped, color: 'text-[#B8C6A5]', icon: '✅' }
                        ].map((item) => (
                            <div key={item.label} className="bg-white border-2 border-[#3C4142] p-2 py-3 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                                <span className="text-lg mb-1">{item.icon}</span>
                                <span className={`text-xl font-black ${item.color}`}>
                                    {item.val}
                                </span>
                                <span className="text-[10px] text-black uppercase font-extrabold mt-1 tracking-wide">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- LOGOUT BUTTON --- */}
                <button 
                    onClick={handleLogout}
                    className="mc-button-green w-full py-3 border-4 border-[#3C4142] text-black font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#3C4142] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                    <LogOut size={18} />
                    Logout
                </button>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;