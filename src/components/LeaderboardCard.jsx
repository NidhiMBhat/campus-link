import React, { useEffect, useState } from 'react';
import { Trophy, Medal, User, Loader2 } from 'lucide-react';
import { db } from "../firebase";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const LeaderboardCard = () => {
  const [topHelpers, setTopHelpers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const usersRef = collection(db, "users");
        // Query users ordered by credits descending, limited to top 5
        const q = query(usersRef, orderBy("credits", "desc"), limit(5));
        
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
                <span className={`w-6 text-sm font-bold ${
                  index === 0 ? "text-yellow-400" : 
                  index === 1 ? "text-gray-300" : 
                  index === 2 ? "text-orange-400" : "text-gray-500"
                }`}>
                  #{index + 1}
                </span>
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
          <p className="text-sm text-gray-400 mt-1">Complete errands to earn credits and climb the ranks.</p>
        </div>
      )}
    </div>
  );
};

export default LeaderboardCard;