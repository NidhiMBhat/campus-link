import React, { useEffect, useState } from 'react';
import { PlusCircle, List, UserCircle, CheckSquare, Clock, Sword, Map } from 'lucide-react'; 
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

  // Function to handle the permanent acceptance
  const handleAcceptRules = async () => {
    if (!currentUser) return;
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        hasAcceptedRules: true
      });
      setShowRules(false);
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

          if (!userData.hasAcceptedRules) {
            setShowRules(true);
          } else {
             requestNotificationPermission();
          }

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
    /* 1. OUTER WRAPPER: Handles Background (Full Screen) */
    <div className="mc-landscape-bg min-h-screen w-full">
      
      {/* 2. INNER WRAPPER: Handles Content Width (Centered) */}
      <div className="max-w-4xl mx-auto pb-20 relative p-6">

        {showRules && (
          <RuleBookModal onAccept={handleAcceptRules} />
        )}

        {/* Header with Minecraft Panel style */}
        <div className="mc-panel flex justify-between items-center mb-8 p-4">
          <div>
            <h1 className="text-xl font-bold text-black uppercase tracking-tight">
              Welcome back, Player!
            </h1>
            <p className="text-[#555555] text-xs font-bold uppercase">
              Select your quest...
            </p>
          </div>

          <div className="flex items-center gap-2">
              {/* Notification Slot */}
              <div className="mc-slot p-1 flex items-center justify-center bg-[#8B8B8B] w-12 h-12">
                  <NotificationBell currentUser={currentUser} />
              </div>

              {/* Profile Slot */}
              <button 
                  onClick={() => navigate('/profile')} 
                  className="mc-button p-0 w-12 h-12 flex items-center justify-center"
              >
                  <UserCircle size={28} />
              </button>
          </div>
        </div>

        <LeaderboardCard />

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NavCard 
            title="Request Help" 
            desc="Post a new bounty" 
            icon={PlusCircle} 
            to="/request" 
            className="mc-button text-center"
          />
          <NavCard 
            title="Available Tasks" 
            desc="Earn XP & Credits" 
            icon={Sword} 
            to="/tasks" 
            className="mc-button text-center"
          />
          <NavCard 
            title="My Requests" 
            desc="Active Bounties" 
            icon={Map} 
            to="/my-requests" 
            className="mc-button text-center"
          />
          <NavCard 
            title="My Tasks" 
            desc="Current Quests" 
            icon={CheckSquare} 
            to="/my-tasks" 
            className="mc-button text-center"
          />
        </div>

      </div> {/* End Inner Wrapper */}
    </div> /* End Outer Wrapper */
  );
};

export default Home;
