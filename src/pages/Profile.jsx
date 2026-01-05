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
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col">
      <button onClick={() => navigate('/home')} className="mb-6 flex items-center text-gray-400 hover:text-white transition">
        <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
      </button>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 text-center mb-6 shadow-xl">
        <UserCircle size={80} className="mx-auto text-indigo-400 mb-4" />
        <h2 className="text-2xl font-bold text-white">{profileData.fullName}</h2>
        <p className="text-gray-400">{profileData.email}</p>
        <p className="text-gray-500 text-sm mt-1">{profileData.phone}</p>
      </div>

      {/* Stats Grid - Using the queried counts */}
      <div className="grid grid-cols-3 gap-3 text-center mb-6">
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Star className="mx-auto text-yellow-400 mb-2" size={24} />
          <h3 className="text-xl font-bold text-white">{profileData.credits || 0}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Credits</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Activity className="mx-auto text-blue-400 mb-2" size={24} />
          <h3 className="text-xl font-bold text-white">{stats.requested}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Requested</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
          <Activity className="mx-auto text-emerald-400 mb-2" size={24} />
          <h3 className="text-xl font-bold text-white">{stats.helped}</h3>
          <p className="text-xs text-gray-400 uppercase tracking-wide">Helped</p>
        </div>
      </div>

      

      <div className="mt-auto">
        <button onClick={handleLogout} className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 border border-red-900/50 font-bold py-3 rounded-xl transition flex items-center justify-center gap-3">
          <LogOut size={22} /> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;