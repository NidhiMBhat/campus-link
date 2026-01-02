import React from 'react';
import { PlusCircle, List, UserCircle, CheckSquare, Clock } from 'lucide-react'; // Added Clock icon
import NavCard from '../components/NavCard';
import LeaderboardCard from '../components/LeaderboardCard';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-6 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hello, Student! 👋</h1>
          <p className="text-gray-400 text-sm">What do you need help with today?</p>
        </div>

        {/* Profile Icon with Tooltip */}
        <div className="relative group">
          <button 
            onClick={() => navigate('/profile')} 
            className="p-2 bg-gray-800 rounded-full text-indigo-400 hover:bg-gray-750 hover:text-indigo-300 transition shadow-md border border-gray-700"
          >
            <UserCircle size={32} />
          </button>
          <span className="absolute top-full right-0 mt-2 px-3 py-1 text-xs font-medium text-white bg-gray-700 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            My Profile
          </span>
        </div>
      </div>

      <LeaderboardCard />

      {/* Grid Layout: 1 col mobile, 2 col laptop */}
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
        {/* Changed from Profile to My Requests */}
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