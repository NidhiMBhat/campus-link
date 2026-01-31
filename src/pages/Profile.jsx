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
    <div className="min-h-screen flex items-center justify-center bg-[#111] text-white font-bold uppercase tracking-widest">
        Loading Character...
    </div>
  );

  return (
    // MAIN CONTAINER: Dark Cubes Background
    <div className="min-h-screen w-full font-mono bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      <div className="p-6 max-w-2xl mx-auto flex flex-col">
        
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          className="mb-8 flex items-center text-white hover:text-yellow-400 transition group w-fit"
        >
          <div className="bg-[#555] p-1 border-2 border-black group-active:translate-y-1 mr-2">
             <ArrowLeft size={20} />
          </div>
          <span className="uppercase font-bold tracking-widest text-xs shadow-black drop-shadow-md">Back to Menu</span>
        </button>

        {/* Title */}
        <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:3px_3px_#000]">
                Player Card
            </h1>
        </div>

        {/* === MAIN PROFILE GUI === */}
        <div className="bg-[#C6C6C6] border-4 border-black p-1 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="border-2 border-[#555] p-4 sm:p-6 bg-[#C6C6C6] shadow-[inset_3px_3px_0px_#FFF,inset_-3px_-3px_0px_#555]">
                
                {/* --- IDENTITY CARD SECTION (The "Book" Look) --- */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    
                    {/* LEFT: Avatar Frame */}
                    <div className="flex flex-col items-center justify-center">
                        {/* Item Frame Style */}
                        <div className="w-32 h-32 bg-[#8B4513] border-4 border-black flex items-center justify-center shadow-[inset_4px_4px_0px_#5D4037,inset_-4px_-4px_0px_#A1887F] relative">
                            {/* Inner Dark Slot */}
                            <div className="w-24 h-24 bg-[#1a1a1a] border-2 border-[#5a4d41] flex items-center justify-center shadow-inner">
                                <UserCircle size={88} className="text-[#DDD]" />
                            </div>
                            {/* "Item Frame" corner bolts */}
                            <div className="absolute top-1 left-1 w-1 h-1 bg-[#A1887F]"></div>
                            <div className="absolute top-1 right-1 w-1 h-1 bg-[#A1887F]"></div>
                            <div className="absolute bottom-1 left-1 w-1 h-1 bg-[#A1887F]"></div>
                            <div className="absolute bottom-1 right-1 w-1 h-1 bg-[#A1887F]"></div>
                        </div>
                    </div>

                    {/* RIGHT: Paper Info Block */}
                    <div className="flex-1 bg-[#e3dcb2] border-2 border-black p-4 shadow-[inset_3px_3px_0px_#d4cba0,inset_-2px_-2px_0px_#8f865d] relative overflow-hidden flex flex-col justify-center">
                        
                        {/* Name Header */}
                        <div className="border-b-2 border-[#8f865d] pb-2 mb-3">
                            <h2 className="text-2xl font-bold text-[#3d3326] uppercase tracking-wide leading-none">
                                {profileData.fullName}
                            </h2>
                            <span className="text-[10px] text-[#756a56] font-bold uppercase tracking-widest">
                                Student | RVCE Server
                            </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Mail size={16} className="text-[#8B4513]" />
                                <div>
                                    <p className="text-[10px] text-[#756a56] font-bold uppercase">Linked Email</p>
                                    <p className="text-sm font-bold text-[#333] break-all">{profileData.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone size={16} className="text-[#8B4513]" />
                                <div>
                                    <p className="text-[10px] text-[#756a56] font-bold uppercase">Communicator</p>
                                    <p className="text-sm font-bold text-[#333]">{profileData.phone || "Not Equipped"}</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Decorative Stamp */}
                        <div className="absolute -bottom-4 -right-4 opacity-10 rotate-[-15deg]">
                            <Shield size={80} className="text-black" />
                        </div>
                    </div>
                </div>

                {/* --- STATS INVENTORY --- */}
                <div className="bg-[#8B8B8B] p-3 border-4 border-black shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF] mb-6">
                    <p className="text-white text-xs font-bold mb-2 uppercase tracking-wide shadow-black drop-shadow-md">
                        Statistics
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: 'Credits', val: profileData.credits, color: 'text-[#FCD34D]', icon: '🪙' },
                            { label: 'Requests', val: stats.requested, color: 'text-[#C42C2C]', icon: '📜' },
                            { label: 'Helped', val: stats.helped, color: 'text-[#39ff14]', icon: '✅' }
                        ].map((item) => (
                            <div key={item.label} className="bg-[#8B8B8B] border-2 border-[#373737] p-2 py-3 flex flex-col items-center justify-center shadow-[inset_2px_2px_0px_#373737,inset_-2px_-2px_0px_#FFF] hover:bg-[#9B9B9B] transition-colors">
                                <span className="text-lg mb-1">{item.icon}</span>
                                <span className={`text-xl font-bold ${item.color} [text-shadow:2px_2px_#000]`}>
                                    {item.val}
                                </span>
                                {/* Permanent Label (No Hover) */}
                                <span className="text-[10px] text-white uppercase font-bold mt-1 tracking-wide shadow-black drop-shadow-sm">
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- LOGOUT BUTTON --- */}
                <button 
                    onClick={handleLogout}
                    className="w-full py-3 bg-[#A32222] hover:bg-[#C42C2C] border-4 border-black text-white font-bold uppercase tracking-widest shadow-[inset_4px_4px_0px_0px_#EF5350,inset_-4px_-4px_0px_0px_#500000] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3"
                >
                    <LogOut size={18} />
                    Logout from Server
                </button>

            </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;