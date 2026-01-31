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
    // Background: Darker, textured "Nether/Deepslate" feel
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* Main Panel ("The Block") 
          - Added hover animation to float slightly
      */}
      <div className="bg-[#c6c6c6] w-full max-w-md p-1 border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] transition-transform hover:-translate-y-1 duration-300">
        
        {/* Inner Bevel Container */}
        <div className="border-t-4 border-l-4 border-white border-b-4 border-r-4 border-[#555] p-8">

          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:4px_4px_#000,-2px_-2px_#AA6C39]">
              Join Server
            </h1>
            <p className="text-xs font-bold text-[#555] mt-2 uppercase tracking-wide">
              Create your character
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Full Name Input */}
            <div className="group">
              <label className="block text-xs font-bold mb-1 uppercase text-[#333] group-hover:text-blue-700 transition-colors">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Your full name"
                className="w-full bg-[#222] border-2 border-[#555] p-3 text-white font-mono outline-none 
                           placeholder-gray-500 shadow-[inset_4px_4px_0px_#000]
                           focus:border-[#A855F7] focus:bg-black transition-all"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-bold mb-1 uppercase text-[#333] group-hover:text-blue-700 transition-colors">
                College Email
              </label>
              <input
                type="email"
                placeholder="you@rvce.edu.in"
                className="w-full bg-[#222] border-2 border-[#555] p-3 text-white font-mono outline-none 
                           placeholder-gray-500 shadow-[inset_4px_4px_0px_#000]
                           focus:border-[#A855F7] focus:bg-black transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Phone Input */}
            <div className="group">
              <label className="block text-xs font-bold mb-1 uppercase text-[#333] group-hover:text-blue-700 transition-colors">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="+91 XXXXXXXXXX"
                className="w-full bg-[#222] border-2 border-[#555] p-3 text-white font-mono outline-none 
                           placeholder-gray-500 shadow-[inset_4px_4px_0px_#000]
                           focus:border-[#A855F7] focus:bg-black transition-all"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-xs font-bold mb-1 uppercase text-[#333] group-hover:text-blue-700 transition-colors">
                Create Password
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

            {/* REGISTER BUTTON (Emerald Green) */}
            <button
              type="submit"
              className="w-full py-4 px-6 font-bold uppercase tracking-wider text-white 
                         bg-[#3c8527] border-4 border-black mt-6
                         shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513]
                         hover:bg-[#4ca633] active:translate-y-1 active:shadow-none transition-all
                         text-shadow-[2px_2px_#000]"
            >
              Spawn Character
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center text-sm font-bold border-t-2 border-[#777] pt-4 border-dashed">
            <p className="text-[#444] mb-2 text-xs">Already have a character?</p>
            <Link to="/" className="text-blue-700 hover:text-blue-500 hover:tracking-wide transition-all uppercase decoration-2 hover:underline">
              Login To World &rarr;
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;