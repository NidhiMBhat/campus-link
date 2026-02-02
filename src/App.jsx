import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RequestTask from './pages/RequestTask';
import Tasks from './pages/Tasks';
import MyTasks from './pages/MyTasks';
import MyRequests from './pages/MyRequests'; 
import AdminPanel from './pages/AdminPanel';
function App() {
  return (
    <div className="min-h-screen w-full bg-gray-900 text-white">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/request" element={<RequestTask />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/admin" element={<AdminPanel />} />
   
        <Route path="/my-requests" element={<MyRequests />} /> 
      </Routes>
      {/* FIXED BETA BADGE */}
<div className="fixed bottom-4 right-4 z-50 pointer-events-none select-none">
  <div className="opacity-50 text-white font-bold text-xs px-2 py-1 uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]">
    BETA
  </div>
</div>
    </div>
  );
}

export default App;