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
    <div className="min-h-screen w-full bg-gray-900 text-white relative">
      {/* Beta Label */}
      <div className="fixed bottom-4 right-4 z-[999] text-black/40 text-xs font-medium uppercase tracking-widest" style={{ fontFamily: 'Inter, sans-serif' }}>
        Beta
      </div>
      
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
    </div>
  );
}

export default App;