import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import RequestTask from './pages/RequestTask';
import Tasks from './pages/Tasks';
import MyTasks from './pages/MyTasks';
import MyRequests from './pages/MyRequests'; // <--- 1. Make sure this import is here!

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
        
   
        <Route path="/my-requests" element={<MyRequests />} /> 
      </Routes>
    </div>
  );
}

export default App;