import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword } from 'firebase/auth'; 
import { auth } from '../firebase'; 

const Login = () => {
  const navigate = useNavigate();
  const { login, forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- ADMIN CREDENTIALS ---
  const ADMIN_EMAIL = "admin@campuslink.com";
  const ADMIN_DEFAULT_PASS = "power123!"; 

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. ADMIN LOGIN
      if (email === ADMIN_EMAIL) {
        if (password !== ADMIN_DEFAULT_PASS) {
            alert("Invalid Admin Password");
            return;
        }
        await signInWithEmailAndPassword(auth, email, password);
        console.log("Admin logged in, redirecting...");
        navigate('/admin'); 
        return;
      }

      // 2. STUDENT LOGIN
      const collegeRegex = /^[a-zA-Z0-9._%+-]+@rvce\.edu\.in$/;
      if (!collegeRegex.test(email)) {
        alert("Please use a valid @rvce.edu.in email");
        return;
      }

      const res = await login(email, password); 
      if (!res) return;

      navigate('/home');

    } catch (err) {
      console.error(err);
      if(err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
          alert("Invalid Email or Password");
      } else {
          alert(err.message); 
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      alert("Please enter your college email first.");
      return;
    }
    const collegeRegex = /^[a-zA-Z0-9._%+-]+@rvce\.edu\.in$/;
    if (!collegeRegex.test(email)) {
      alert("Please use a valid @rvce.edu.in email");
      return;
    }
    try {
      await forgotPassword(email);
      alert("If an account exists, a password reset link has been sent.");
    } catch (err) {
      console.error(err);
      alert("If an account exists, a password reset link has been sent.");
    }
  };

  return (
    // Background: Darker, cleaner, with a subtle texture feel
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* The Main Panel ("The Block")
         - Added a "float" animation (hover:scale) to make it feel alive.
         - Changed border to a dark grey/blue for a 'Cobblestone' feel rather than flat grey.
      */}
      <div className="bg-[#c6c6c6] w-full max-w-md p-1 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1 duration-300">
        
        {/* Inner Bevel Container */}
        <div className="border-t-4 border-l-4 border-white border-b-4 border-r-4 border-[#555] p-8">
          
          {/* Header with MINECRAFT GOLD Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:4px_4px_#000,-2px_-2px_#AA6C39]">
              CampusLink
            </h1>
            <p className="text-xs font-bold text-[#555] mt-3 uppercase tracking-widest bg-white/20 inline-block px-2 py-1">
              Connect. Help. Earn credits.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="group">
              <label className="block text-xs font-bold mb-2 uppercase text-[#333] group-hover:text-blue-700 transition-colors">
                College Email
              </label>
              <input 
                  type="email"
                  placeholder="you@rvce.edu.in"
                  className="w-full bg-[#222] border-2 border-[#555] p-3 text-white font-mono outline-none 
                             placeholder-gray-500 shadow-[inset_4px_4px_0px_#000]
                             focus:border-[#A855F7] focus:bg-black transition-all" 
                  // focus:border-[#A855F7] gives it an "Enchanted Item" purple glow
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-xs font-bold mb-2 uppercase text-[#333] group-hover:text-blue-700 transition-colors">
                Password
              </label>
              <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-[#222] border-2 border-[#555] p-3 text-white font-mono outline-none 
                             placeholder-gray-500 shadow-[inset_4px_4px_0px_#000]
                             focus:border-[#A855F7] focus:bg-black transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-bold text-blue-700 hover:text-blue-500 uppercase tracking-wide hover:underline decoration-2 underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            {/* THE BUTTON (Emerald/Green Style)
                - Using a distinct Green to stand out from the grey background.
                - Added active:translate-y-1 for that satisfying "click" feel.
            */}
            <button 
              type="submit" 
              className="w-full py-4 px-6 font-bold uppercase tracking-wider text-white 
                         bg-[#3c8527] border-4 border-black 
                         shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513]
                         hover:bg-[#4ca633] active:translate-y-1 active:shadow-none transition-all
                         text-shadow-[2px_2px_#000]"
            >
              Login To World
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm font-bold border-t-2 border-[#777] pt-4 border-dashed">
            <p className="text-[#444] mb-2 text-xs">New Player?</p>
            <Link to="/register" className="text-blue-700 hover:text-blue-500 hover:tracking-wide transition-all uppercase decoration-2 hover:underline">
              Create New Character &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;