import React, { useEffect } from 'react';
import { PlusCircle, List, UserCircle, CheckSquare, Clock } from 'lucide-react'; 
import NavCard from '../components/NavCard';
import LeaderboardCard from '../components/LeaderboardCard';
import { useNavigate } from 'react-router-dom';
import { requestAndStoreLocation } from "../services/location";
import { checkNearbyRequests } from "../services/notifications";
import NotificationBell from "../components/NotificationBell";
import { auth } from "../firebase";

const Home = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
    
  useEffect(() => {
    if (!currentUser) return;

    requestAndStoreLocation(currentUser);
    (async () => {
      const result = await checkNearbyRequests(currentUser);
      console.log("Nearby requests check done", result);
    })();
      
    checkNearbyRequests(currentUser);
  }, [currentUser]);

  return (
    // Added relative to manage z-index of glows
    <div className="min-h-screen p-6 pb-20 max-w-4xl mx-auto relative">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, Student! 👋</h1>
          <p className="text-gray-400 text-sm">What do you need help with today?</p>
        </div>

        {/* Icons Container: Bell + Profile */}
        <div className="flex items-center gap-4">
            
            {/* Notification Bell with Glow Effect */}
            <div className="relative group">
                <div className="p-2 bg-gray-800 rounded-full border border-gray-700 
                                transition-all duration-300 cursor-pointer flex items-center justify-center
                                group-hover:bg-gray-700 group-hover:border-yellow-500/50 
                                group-hover:shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <NotificationBell currentUser={currentUser} />
                </div>
            </div>

            {/* Profile Icon */}
            <div className="relative group">
                <button 
                    onClick={() => navigate('/profile')} 
                    className="p-2 bg-gray-800 rounded-full text-indigo-400 border border-gray-700
                               transition-all duration-300 shadow-md flex items-center justify-center
                               hover:bg-gray-750 hover:text-indigo-300 hover:border-indigo-500/50 
                               hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                >
                    <UserCircle size={34} />
                </button>
                <span className="absolute top-full right-0 mt-2 px-3 py-1 text-xs font-medium text-white bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    My Profile
                </span>
            </div>
        </div>
      </div>

      <LeaderboardCard />

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NavCard 
          title="Request Help" 
          desc="Need a quick errand run?" 
          icon={PlusCircle} 
          to="/request" 
          color="bg-indigo-500"
        />
        <NavCard 
          title="Available Tasks" 
          desc="Earn credits by helping others" 
          icon={List} 
          to="/tasks" 
          color="bg-emerald-500"
        />
        <NavCard 
          title="My Requests" 
          desc="Track your active orders" 
          icon={Clock} 
          to="/my-requests" 
          color="bg-blue-500"
        />
        <NavCard 
          title="My Tasks" 
          desc="Track accepted commitments" 
          icon={CheckSquare} 
          to="/my-tasks" 
          color="bg-orange-500"
        />
      </div>
    </div>
  );
};

export default Home;