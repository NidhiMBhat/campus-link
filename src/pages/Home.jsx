import React, { useEffect, useState } from 'react';
import { PlusCircle, List, UserCircle, CheckSquare, Clock } from 'lucide-react'; 
import NavCard from '../components/NavCard';
import LeaderboardCard from '../components/LeaderboardCard';
import { useNavigate } from 'react-router-dom';
import { requestAndStoreLocation } from "../services/location";
import { checkNearbyRequests } from "../services/notifications";
import NotificationBell from "../components/NotificationBell";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import Firestore methods
import RuleBookModal from '../components/RuleBookModal';

const Home = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  
  // State defaults to FALSE so we don't show it until we verify with DB
  const [showRules, setShowRules] = useState(false); 

  // Function to handle the permanent acceptance
  const handleAcceptRules = async () => {
    if (!currentUser) return;
    try {
      // 1. Update Firestore permanently
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        hasAcceptedRules: true
      });
      // 2. Hide Modal locally
      setShowRules(false);
    } catch (error) {
      console.error("Error saving rule acceptance:", error);
      // Fallback: hide it anyway so user isn't stuck
      setShowRules(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    // --- CHECK USER STATUS (Rules & Credits) ---
    const checkUserProfile = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Check 1: Have they accepted rules yet?
          // If 'hasAcceptedRules' is undefined or false, show the modal
          if (!userData.hasAcceptedRules) {
            setShowRules(true);
          }

          // Check 2: Do they have their starting credits? (Safety check for old users)
          if (userData.credits === undefined) {
             // If credits are missing, assign default 50
             await updateDoc(userRef, { credits: 50 });
          } else if (userData.credits === 0) {
             // If credits are 0, check if they are brand new (no history)
             if ((userData.helped || 0) === 0 && (userData.requested || 0) === 0) {
                await updateDoc(userRef, { credits: 50 });
             }
          }
        }
      } catch (err) {
        console.error("Profile check failed:", err);
      }
    };
    
    checkUserProfile();
    // -------------------------------------------

    requestAndStoreLocation(currentUser);
    (async () => {
      const result = await checkNearbyRequests(currentUser);
      console.log("Nearby requests check done", result);
    })();
      
    // checkNearbyRequests(currentUser);
  }, [currentUser]);

  return (
    // Added relative to manage z-index of glows
    <div className="min-h-screen p-6 pb-20 max-w-4xl mx-auto relative">
      
      {/* --- RULEBOOK MODAL --- */}
      {/* Shows only if DB says hasAcceptedRules: false */}
      {showRules && (
        <RuleBookModal onAccept={handleAcceptRules} />
      )}

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