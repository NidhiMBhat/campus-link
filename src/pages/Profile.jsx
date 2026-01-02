import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserCircle, Star, Activity, LogOut } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return <p>Loading...</p>;

  
  /* Default stats (Initial state for a new user)
  const [stats, setStats] = useState({
    credits: 120,
    requested: 5,
    helped: 12
  });*/

  /*useEffect(() => {
    // 1. READ STATS FROM DATABASE (Local Storage)
    const savedStats = localStorage.getItem('user_stats');
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    } else {
      // If no stats exist yet, save the defaults so other pages can use them
      localStorage.setItem('user_stats', JSON.stringify(stats));
    }
  }, []);*/

  const handleLogout = () => {
    // Optional: You can clear storage if you want to reset everything on logout
    // localStorage.clear(); 
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col">
      <button onClick={() => navigate('/home')} className="mb-6 flex items-center text-gray-400 hover:text-white transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center mb-6 shadow-xl">
        <UserCircle size={80} className="mx-auto text-indigo-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">{user.fullName}</h2>
        <p className="text-gray-400">{user.email}</p>
        <p className="text-gray-500 text-sm mt-1">{user.phone}</p>
      </div>

      {/* Stats Grid - Now reads from 'stats' state */}
      <div className="grid grid-cols-3 gap-3 text-center mb-8">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Star className="mx-auto text-yellow-400 mb-2" size={24} />
          <h3 className="text-xl font-bold text-white">{user.credits}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Credits</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Activity className="mx-auto text-blue-400 mb-2" size={24} />
          <h3 className="text-xl font-bold text-white">{user.requested}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Requested</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Activity className="mx-auto text-emerald-400 mb-2" size={24} />
          <h3 className="text-xl font-bold text-white">{user.helped}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Helped</p>
        </div>
      </div>

      <div className="mt-auto">
         <button 
          onClick={handleLogout} 
          className="w-full bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800 font-bold py-3 rounded-xl transition flex items-center justify-center gap-3"
        >
          <LogOut size={22} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;