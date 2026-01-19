import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UserCircle, Star, Activity, LogOut, History, ChevronRight } from 'lucide-react';
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

    // 2. Fetch Counts from Requests Collection
    const fetchCounts = async () => {
      const requestsRef = collection(db, "requests");

      // Count tasks where user is the requester
      const qRequested = query(requestsRef, where("requesterId", "==", authUser.uid));
      const requestedSnap = await getCountFromServer(qRequested);

      // Count tasks where user is the helper AND it is completed
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

  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="min-h-screen p-6 bg-[#1a1a1a] bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
      <div className="max-w-2xl mx-auto mc-panel p-6 sm:p-10 relative">
        
        {/* Navigation - Top Bar */}
        <div className="flex justify-between items-center mb-10">
          <button 
            onClick={() => navigate('/home')} 
            className="mc-button px-6 py-2 flex items-center gap-2"
          >
            <span>{"<"}</span> 
            <span className="hidden sm:inline text-sm">Back to Menu</span>
          </button>
          
         
        </div>

        {/* Character Info Panel */}
        <div className="bg-[#313131] border-4 border-black p-6 mb-8 shadow-[inset_-4px_-4px_#1e1e1e,inset_4px_4px_#5a5a5a]">
          <div className="flex flex-col md:flex-row items-center gap-6">
            
            {/* Avatar Block */}
            <div className="w-24 h-24 bg-[#8B8B8B] border-4 border-black flex items-center justify-center shadow-[inset_-4px_-4px_#5a5a5a]">
              <UserCircle size={64} className="text-[#C6C6C6]" />
            </div>

            {/* Stats / Lore Text */}
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-3xl font-bold text-[#ffffff] [text-shadow:3px_3px_#000]">
                {profileData.fullName}
              </h2>
              
              <div className="flex flex-col gap-1 pt-2">
                <p className="text-[#aaa] text-sm flex items-center justify-center md:justify-start gap-2">
                   <span className="text-indigo-400 font-bold">Email:</span>
                   {profileData.email}
                </p>
                <p className="text-[#aaa] text-sm flex items-center justify-center md:justify-start gap-2">
                   <span className="text-indigo-400 font-bold">Phone:</span>
                   {profileData.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Slots (Stats) */}
        <p className="text-[#555] mb-2 uppercase text-xs font-bold tracking-widest">Player Statistics</p>
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Credits', val: profileData.credits, color: 'text-yellow-400' },
            { label: 'Requests', val: stats.requested, color: 'text-blue-400' },
            { label: 'Helped', val: stats.helped, color: 'text-[#39ff14]' }
          ].map((item) => (
            <div key={item.label} className="bg-[#8B8B8B] border-4 border-black shadow-[inset_-4px_-4px_#5A5A5A] p-4 flex flex-col items-center justify-center hover:bg-[#999] transition-colors">
              <span className={`text-2xl font-bold ${item.color} [text-shadow:2px_2px_#000]`}>
                {item.val}
              </span>
              <span className="text-[10px] text-white uppercase mt-1">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          
          
          <button 
            onClick={handleLogout}
            className="w-full mc-button py-4 bg-[#a32222] hover:bg-[#c42c2c] border-black text-white"
          >
            Save & Quit
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;