import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Phone, Lock } from "lucide-react";
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
      alert("Verification email sent! Please verify before logging in.");
      navigate("/"); // send them back to login page
    } catch (err) {
      alert(err.message);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700">
        <h1 className="text-2xl font-bold text-white text-center mb-6">Join CampusLink</h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full bg-gray-900 border border-gray-700 text-white pl-10 py-3 rounded-xl focus:border-indigo-500 outline-none"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="email"
              placeholder="you@rvce.edu.in"
              className="w-full bg-gray-900 border border-gray-700 text-white pl-10 py-3 rounded-xl focus:border-indigo-500 outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="tel"
              placeholder="Mobile Number"
              className="w-full bg-gray-900 border border-gray-700 text-white pl-10 py-3 rounded-xl focus:border-indigo-500 outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-500" size={20} />
            <input
              type="password"
              placeholder="Create Password"
              className="w-full bg-gray-900 border border-gray-700 text-white pl-10 py-3 rounded-xl focus:border-indigo-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl mt-4 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-emerald-400 hover:text-emerald-300 font-medium">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
