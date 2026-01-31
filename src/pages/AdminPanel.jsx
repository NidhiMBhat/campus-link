import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ShieldAlert, CheckCircle, Ban, LogOut } from "lucide-react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth"; 

const AdminPanel = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Security: Kick out if not admin email
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || user.email !== "admin@campuslink.com") {
        navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleBan = async (userId, currentStatus) => {
    const action = currentStatus ? "Unban" : "Blacklist";
    if(!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            isBlacklisted: !currentStatus
        });
        setUsers(prev => prev.map(u => 
            u.id === userId ? { ...u, isBlacklisted: !currentStatus } : u
        ));
    } catch (err) {
        alert("Failed to update status");
    }
  };

  const handleExit = async () => {
      await signOut(auth); // Log out the admin
      navigate("/");       // Go back to Login Page
  };

  const filteredUsers = users.filter(u => 
    u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // MAIN CONTAINER: Dark Bedrock Background
    <div className="min-h-screen w-full font-mono bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] p-6">
      
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FF5555] [text-shadow:3px_3px_#000] flex items-center gap-3">
                    <ShieldAlert size={32} className="drop-shadow-md" /> 
                    Server Operator
                </h1>
                <div className="bg-[#00000080] px-2 py-1 mt-2 inline-block border-l-4 border-[#FF5555]">
                    <p className="text-gray-300 text-xs font-bold uppercase tracking-wide">
                        Admin Dashboard & User Management
                    </p>
                </div>
            </div>

            <button 
                onClick={handleExit} 
                className="bg-[#555] hover:bg-[#666] text-white border-4 border-black px-6 py-2 font-bold uppercase tracking-wider shadow-[inset_3px_3px_0px_#777,inset_-3px_-3px_0px_#333] active:translate-y-1 transition-all flex items-center gap-2"
            >
                <LogOut size={18} /> Disconnect
            </button>
        </div>

        {/* Search Panel (Command Block Style) */}
        <div className="bg-[#C6C6C6] border-4 border-black p-4 mb-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input 
                    type="text"
                    placeholder="/search users [name or email]"
                    className="w-full bg-[#1a1a1a] border-2 border-[#555] py-3 pl-12 pr-4 text-white font-mono placeholder-gray-600 focus:outline-none focus:border-[#FF5555] shadow-[inset_4px_4px_0px_#000]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* User Table (GUI Panel) */}
        <div className="bg-[#C6C6C6] border-4 border-black p-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="p-10 text-center flex flex-col items-center">
                         <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4"></div>
                         <span className="font-bold text-[#333] uppercase">Fetching Player Data...</span>
                    </div>
                ) : filteredUsers.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        {/* Table Head */}
                        <thead className="bg-[#8B8B8B] text-white uppercase text-xs border-b-4 border-black">
                            <tr>
                                <th className="p-4 border-r-2 border-[#555] shadow-[inset_2px_2px_0px_#AAA]">User Identity</th>
                                <th className="p-4 border-r-2 border-[#555] shadow-[inset_2px_2px_0px_#AAA]">Credits</th>
                                <th className="p-4 border-r-2 border-[#555] shadow-[inset_2px_2px_0px_#AAA]">Status</th>
                                <th className="p-4 text-right shadow-[inset_2px_2px_0px_#AAA]">Ban Hammer</th>
                            </tr>
                        </thead>
                        
                        {/* Table Body */}
                        <tbody className="bg-[#DDD]">
                            {filteredUsers.map((user, index) => (
                                <tr key={user.id} className={`border-b-2 border-[#999] transition hover:bg-[#EEE] ${index % 2 === 0 ? 'bg-[#D6D6D6]' : 'bg-[#C6C6C6]'}`}>
                                    
                                    {/* Name & Email */}
                                    <td className="p-4 border-r-2 border-[#999]">
                                        <p className="font-bold text-[#333] uppercase tracking-wide">{user.fullName || "Unknown Player"}</p>
                                        <p className="text-xs text-[#555] font-mono font-bold">{user.email}</p>
                                    </td>

                                    {/* Credits */}
                                    <td className="p-4 border-r-2 border-[#999]">
                                        <span className="text-[#B8860B] font-bold">
                                            {user.credits} <span className="text-[10px] text-black">Cr</span>
                                        </span>
                                    </td>

                                    {/* Status Badge */}
                                    <td className="p-4 border-r-2 border-[#999]">
                                        {user.isBlacklisted ? (
                                            <span className="bg-[#A32222] border-2 border-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center w-fit gap-1 shadow-[2px_2px_0px_#000]">
                                                <Ban size={12} /> BANNED
                                            </span>
                                        ) : (
                                            <span className="bg-[#3c8527] border-2 border-black text-white px-2 py-1 text-[10px] font-bold uppercase tracking-wide flex items-center w-fit gap-1 shadow-[2px_2px_0px_#000]">
                                                <CheckCircle size={12} /> ACTIVE
                                            </span>
                                        )}
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => toggleBan(user.id, user.isBlacklisted)}
                                            className={`px-4 py-2 border-2 border-black text-[10px] font-bold uppercase tracking-wider transition active:translate-y-1 shadow-[2px_2px_0px_#000] ${
                                                user.isBlacklisted 
                                                ? "bg-[#5D737E] hover:bg-[#6D838E] text-white shadow-[inset_2px_2px_0px_#A2B9C4]" 
                                                : "bg-[#FF5555] hover:bg-[#FF6666] text-white shadow-[inset_2px_2px_0px_#FFAAAA]"
                                            }`}
                                        >
                                            {user.isBlacklisted ? "REVOKE BAN" : "BAN PLAYER"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-10 text-center text-[#555] font-bold uppercase">
                        No players found matching query.
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;