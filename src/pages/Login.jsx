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
    // Background: Matte Campus with drifting grid
    <div className="app-canvas min-h-screen flex items-center justify-center p-4">
      
      {/* The Main Panel ("The Block")
         - Added a "float" animation (hover:scale) to make it feel alive.
         - Changed border to a dark grey/blue for a 'Cobblestone' feel rather than flat grey.
      */}
      <div className="mc-panel w-full max-w-md shadow-[4px_4px_0px_0px_#3C4142] transition-transform hover:-translate-y-1 duration-300">
        
        {/* Inner Container */}
        <div className="p-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black uppercase tracking-widest text-black">
              CampusLink
            </h1>
            <p className="text-xs font-extrabold text-[#3C4142] mt-3 uppercase tracking-widest">
              Connect. Help. Earn credits.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Email Field */}
            <div className="group">
              <label className="block text-xs font-black mb-2 uppercase text-black">
                College Email
              </label>
              <input 
                  type="email"
                  placeholder="you@rvce.edu.in"
                  className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none 
                             placeholder-gray-500 shadow-[inset_2px_2px_0px_#ddd]
                             focus:border-[#B8C6A5] transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
              />
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block text-xs font-black mb-2 uppercase text-black">
                Password
              </label>
              <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none 
                             placeholder-gray-500 shadow-[inset_2px_2px_0px_#ddd]
                             focus:border-[#B8C6A5] transition-all"
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
                className="text-xs font-bold text-[#3C4142] hover:text-black uppercase tracking-wide hover:underline decoration-2 underline-offset-2"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button 
              type="submit" 
              className="mc-button-green w-full py-4 px-6 font-black uppercase tracking-wider text-black 
                         border-4 border-[#3C4142] shadow-[4px_4px_0px_0px_#3C4142]
                         hover:brightness-105 active:translate-y-1 active:shadow-none transition-all"
            >
              Login
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm font-bold border-t-2 border-[#3C4142] pt-4 border-dashed">
            <p className="text-[#3C4142] mb-2 text-xs">New here?</p>
            <Link to="/register" className="text-black font-black hover:underline transition-all uppercase decoration-2">
              Create Account &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;