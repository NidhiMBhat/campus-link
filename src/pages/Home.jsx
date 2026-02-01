import React, { useEffect, useState } from 'react';
import { PlusCircle, UserCircle, CheckSquare, Sword, Map } from 'lucide-react'; 
import NavCard from '../components/NavCard';
import LeaderboardCard from '../components/LeaderboardCard';
import { useNavigate } from 'react-router-dom';
import { requestAndStoreLocation } from "../services/location";
import NotificationBell from "../components/NotificationBell";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore"; 
import RuleBookModal from '../components/RuleBookModal';
import { checkNearbyRequests, requestNotificationPermission } from "../services/notifications";

const Home = () => {
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const [showRules, setShowRules] = useState(false); 

  // Function to handle the permanent acceptance of rules
  const handleAcceptRules = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        hasAcceptedRules: true
      });
      setShowRules(false);
      
      // Request notification permission immediately after rules are accepted
      requestNotificationPermission(); 

    } catch (error) {
      console.error("Error saving rule acceptance:", error);
      setShowRules(false);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const checkUserProfile = async () => {
      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // Rule acceptance check
          if (!userData.hasAcceptedRules) {
            setShowRules(true);
          } else {
             requestNotificationPermission();
          }

          // Credits initialization logic
          if (userData.credits === undefined) {
             await updateDoc(userRef, { credits: 50 });
          } else if (userData.credits === 0) {
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
    requestAndStoreLocation(currentUser);

    (async () => {
      const result = await checkNearbyRequests(currentUser);
      console.log("Nearby requests check done", result);
    })();
      
  }, [currentUser]);

 return (
    /* 1. Canvas Container: Renders the drifting grid background */
    <div className="app-canvas min-h-screen p-6">
      <div className="max-w-4xl mx-auto pb-20 relative">
      
      {showRules && (
        <RuleBookModal onAccept={handleAcceptRules} />
      )}

      {/* 2. Header: Refined with Matte Campus borders and black text */}
      <div className="mc-panel flex justify-between items-center mb-10 p-4">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">
            Welcome back, Player!
          </h1>
          <p className="text-slate-500 text-xs font-extrabold uppercase tracking-widest">
            Select your quest...
          </p>
        </div>

        <div className="flex items-center gap-3">
            {/* Notification Slot: Using the new shadow logic */}
            <div className="bg-white border-4 border-[#3C4142] p-1 flex items-center justify-center w-12 h-12 shadow-[2px_2px_0px_0px_#3C4142]">
                <NotificationBell currentUser={currentUser} />
            </div>

            {/* Profile Slot: Tactile button with active state push-down */}
            <button 
                onClick={() => navigate('/profile')} 
                className="bg-[#e0beb3 border-4 border-[#3C4142] w-12 h-12 flex items-center justify-center shadow-[2px_2px_0px_0px_#3C4142] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
                <UserCircle size={28} className="text-[#3C4142]" />
            </button>
        </div>
      </div>

      <LeaderboardCard />

      {/* 3. Action Grid: Force-injecting 'nav-card-base' to ensure black text clarity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
        <NavCard 
          title="Request Help" 
          desc="Post a new bounty" 
          icon={PlusCircle} 
          to="/request" 
          className="nav-card-base mc-button-pink text-center"
        />
        <NavCard 
          title="Available Tasks" 
          desc="Earn XP & Credits" 
          icon={Sword} 
          to="/tasks" 
          className="nav-card-base mc-button-yellow text-center"
        />
        <NavCard 
          title="My Requests" 
          desc="Active Bounties" 
          icon={Map} 
          to="/my-requests" 
          className="nav-card-base mc-button-blue text-center"
        />
        <NavCard 
          title="My Tasks" 
          desc="Current Quests" 
          icon={CheckSquare} 
          to="/my-tasks" 
          className="nav-card-base mc-button-green text-center"
        />
      </div>
    </div>
    </div>
  );
};

export default Home;