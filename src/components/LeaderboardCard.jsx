import React, { useEffect, useState } from 'react';
import { Trophy, Medal, User, Loader2, Crown, Pickaxe } from 'lucide-react'; 
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const LeaderboardCard = () => {
  const [topHelpers, setTopHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, orderBy("credits", "desc"), limit(3));
        
        const querySnapshot = await getDocs(q);
        const leaders = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setTopHelpers(leaders);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index) => {
    // Colors updated to match Minecraft material palette (Gold, Iron, Copper/Bronze)
    if (index === 0) return <Crown size={20} className="text-[#FDB813]" />; 
    if (index === 1) return <Medal size={20} className="text-[#D9D9D9]" />; 
    if (index === 2) return <Medal size={20} className="text-[#B4684D]" />; 
    return <span className="text-black font-bold">#{index + 1}</span>;
  };

  return (
    <div className="mc-panel p-6 mb-6">
      {/* Header with Minecraft Font Style */}
      <div className="flex items-center gap-3 mb-6 border-b-4 border-[#555555] pb-2">
        <Trophy className="text-[#FDB813]" size={24} />
        <h2 className="text-xl font-bold uppercase tracking-wider text-black">
          Top Helpers
        </h2>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-8 gap-2">
          <Loader2 className="animate-spin text-[#555555]" size={32} />
          <p className="text-sm font-bold uppercase text-[#555555]">Loading...</p>
        </div>
      ) : topHelpers.length > 0 ? (
        <div className="space-y-4">
          {topHelpers.map((helper, index) => (
            <div 
              key={helper.id} 
              className="mc-slot flex items-center justify-between p-3"
            >
              <div className="flex items-center gap-4">
                {/* Rank Slot */}
                <div className="w-10 flex justify-center bg-black/20 p-1 border-2 border-black/10">
                  {getRankIcon(index)}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="bg-[#5D737E] p-1 border-2 border-black">
                    <User size={16} className="text-white" />
                  </div>
                  <span className="text-black font-bold uppercase text-sm truncate max-w-[120px]">
                    {helper.fullName || "Player"}
                  </span>
                </div>
              </div>

              {/* Score Display */}
              <div className="text-right flex items-center gap-2">
                <span className="text-[#2e7d32] font-bold text-lg drop-shadow-sm">
                  {helper.credits || 0}
                </span>
                <span className="text-black/60 text-[10px] font-bold uppercase">
                  XP
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mc-slot p-6 text-center border-dashed">
          <Pickaxe className="mx-auto mb-2 text-[#555555]" size={32} />
          <p className="text-black font-bold uppercase text-sm">Empty Server!</p>
          <p className="text-xs text-[#555555] mt-2 italic">Earn credits to claim your spot.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;