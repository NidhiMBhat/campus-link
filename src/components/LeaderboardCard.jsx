import React, { useEffect, useState } from 'react';
import { Trophy, Medal, User, Loader2, Crown } from 'lucide-react'; // Added Crown & Medal
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const LeaderboardCard = () => {
  const [topHelpers, setTopHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, "users");
        // CHANGED: Limited to Top 3 only
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

  // Helper to get the cool icon for the rank
  const getRankIcon = (index) => {
    if (index === 0) return <Crown size={20} className="text-yellow-400 fill-yellow-400/20" />;
    if (index === 1) return <Medal size={20} className="text-gray-300" />;
    if (index === 2) return <Medal size={20} className="text-amber-600" />;
    return <span className="text-gray-500 font-bold">#{index + 1}</span>;
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-indigo-700 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="text-yellow-400" size={24} />
        <h2 className="text-xl font-bold text-white">Top Helpers</h2>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin text-indigo-400" size={24} />
        </div>
      ) : topHelpers.length > 0 ? (
        <div className="space-y-3">
          {topHelpers.map((helper, index) => (
            <div 
              key={helper.id} 
              className="flex items-center justify-between bg-gray-900/40 p-3 rounded-xl border border-white/5"
            >
              <div className="flex items-center gap-3">
                {/* Rank Icon */}
                <div className="w-8 flex justify-center">
                  {getRankIcon(index)}
                </div>
                
                <div className="bg-indigo-500/20 p-1.5 rounded-lg">
                  <User size={16} className="text-indigo-300" />
                </div>
                <span className="text-gray-200 font-medium truncate max-w-[120px]">
                  {helper.fullName || "User"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-white font-bold">{helper.credits || 0}</span>
                <span className="text-indigo-400 text-[10px] ml-1 uppercase">Cr</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 p-4 rounded-xl text-center">
          <p className="text-indigo-200 font-medium">Be the first to reach the top!</p>
          <p className="text-sm text-gray-400 mt-1">Complete errands to earn credits.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;