import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// --- NEW IMPORTS ---
import { signInWithEmailAndPassword } from 'firebase/auth'; // Import direct sign-in
import { auth } from '../firebase'; // Import auth instance

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // We still use this for students
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // --- ADMIN CREDENTIALS ---
  const ADMIN_EMAIL = "admin@campuslink.com";
  // Updated to match your password
  const ADMIN_DEFAULT_PASS = "power123!"; 

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // ---------------------------------------------------------
      // 1. ADMIN LOGIN (Bypasses Regex & Verification Checks)
      // ---------------------------------------------------------
      if (email === ADMIN_EMAIL) {
        if (password !== ADMIN_DEFAULT_PASS) {
            alert("Invalid Admin Password");
            return;
        }
        
        // FIX: Use direct Firebase Login here to bypass the "Email Verified?" check
        // inside your AuthContext.js
        await signInWithEmailAndPassword(auth, email, password);
        
        console.log("Admin logged in, redirecting...");
        navigate('/admin'); // Redirect to Admin Panel
        return;
      }

      // ---------------------------------------------------------
      // 2. STANDARD STUDENT LOGIN (Strict Rules Apply)
      // ---------------------------------------------------------
      
      // The Regex Check is here, so it ONLY applies if you are NOT the admin
      const collegeRegex = /^[a-zA-Z0-9._%+-]+@rvce\.edu\.in$/;
      if (!collegeRegex.test(email)) {
        alert("Please use a valid @rvce.edu.in email");
        return;
      }

      // Use the Context login for students (which enforces email verification)
      const res = await login(email, password); 
      
      if (!res) return;

      navigate('/home');

    } catch (err) {
      console.error(err);
      if(err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          alert("Invalid Email or Password");
      } else {
          alert(err.message); // Shows specific errors like "Verify your email"
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-400">CampusLink</h1>
          <p className="text-gray-400 mt-2">Connect. Help. Earn credits.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">College Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="email"
                placeholder="you@rvce.edu.in"
                className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-500" size={20} />
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-gray-900 border border-gray-700 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            Login <ArrowRight size={20} />
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          New here? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create Account</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;