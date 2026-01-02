import React from 'react';
import { Trophy } from 'lucide-react';

const LeaderboardCard = () => {
  return (
    <div className="bg-linear-to-br from-indigo-900 to-gray-800 p-6 rounded-2xl shadow-lg border border-indigo-700 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Trophy className="text-yellow-400" size={24} />
        <h2 className="text-xl font-bold text-white">Top Helpers</h2>
      </div>
      
      {/* Empty State / Motivation */}
      <div className="bg-gray-900/50 p-4 rounded-xl text-center">
        <p className="text-indigo-200 font-medium">Be the first to reach the top!</p>
        <p className="text-sm text-gray-400 mt-1">Complete errands to earn credits and climb the ranks.</p>
      </div>
    </div>
  );
};

export default LeaderboardCard;