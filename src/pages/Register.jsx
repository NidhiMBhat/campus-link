import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(email, password, fullName, phone);
      alert("Verification email sent! Please verify before logging in [Check spam folder too!]");
      navigate("/"); // send them back to login page
    } catch (err) {
      alert(err.message);
    }
  };
  
  return (
    // Background: Matte Campus with drifting grid
    <div className="app-canvas min-h-screen flex items-center justify-center p-4">
      
      {/* Main Panel ("The Block") 
          - Added hover animation to float slightly
      */}
      <div className="mc-panel w-full max-w-md shadow-[4px_4px_0px_0px_#3C4142] transition-transform hover:-translate-y-1 duration-300">
        
        {/* Inner Container */}
        <div className="p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">
              Join Campus
            </h1>
            <p className="text-xs font-extrabold text-[#3C4142] mt-2 uppercase tracking-wide">
              Create your account
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Full Name Input */}
            <div className="group">
              <label className="block text-xs font-black mb-1 uppercase text-black">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none 
                           placeholder-gray-500 shadow-[inset_2px_2px_0px_#ddd]
                           focus:border-[#B8C6A5] transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-black mb-1 uppercase text-black">
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

            {/* Phone Input */}
            <div className="group">
              <label className="block text-xs font-black mb-1 uppercase text-black">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none 
                           placeholder-gray-500 shadow-[inset_2px_2px_0px_#ddd]
                           focus:border-[#B8C6A5] transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-xs font-black mb-1 uppercase text-black">
                Create Password
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

            {/* Register Button */}
            <button
              type="submit"
              className="mc-button-green w-full py-4 px-6 font-black uppercase tracking-wider text-black 
                         border-4 border-[#3C4142] mt-6 shadow-[4px_4px_0px_0px_#3C4142]
                         hover:brightness-105 active:translate-y-1 active:shadow-none transition-all"
            >
              Create Account
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm font-bold border-t-2 border-[#3C4142] pt-4 border-dashed">
            <p className="text-[#3C4142] mb-2 text-xs">Already have an account?</p>
            <Link to="/" className="text-black font-black hover:underline transition-all uppercase decoration-2">
              Login &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;