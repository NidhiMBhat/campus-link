import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, ShieldAlert, CheckCircle, Ban } from "lucide-react";
import { db, auth } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth"; // Import signOut

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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-red-500 flex items-center gap-3">
                <ShieldAlert size={32} /> Admin Dashboard
            </h1>
            <button 
                onClick={handleExit} // Updated Handler
                className="text-gray-400 hover:text-white flex items-center gap-2"
            >
                <ArrowLeft size={20} /> Logout & Exit
            </button>
        </div>

        {/* Search */}
        <div className="relative mb-8">
            <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
                type="text"
                placeholder="Search users by Name or Email..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-red-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
            {loading ? (
                <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : filteredUsers.length > 0 ? (
                <table className="w-full text-left">
                    <thead className="bg-gray-700 text-gray-300 uppercase text-xs">
                        <tr>
                            <th className="p-4">User</th>
                            <th className="p-4">Credits</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {filteredUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-700/50">
                                <td className="p-4">
                                    <p className="font-bold text-white">{user.fullName || "No Name"}</p>
                                    <p className="text-sm text-gray-400">{user.email}</p>
                                </td>
                                <td className="p-4 text-gray-300">{user.credits}</td>
                                <td className="p-4">
                                    {user.isBlacklisted ? (
                                        <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1">
                                            <Ban size={12} /> BANNED
                                        </span>
                                    ) : (
                                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold flex items-center w-fit gap-1">
                                            <CheckCircle size={12} /> ACTIVE
                                        </span>
                                    )}
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => toggleBan(user.id, user.isBlacklisted)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                                            user.isBlacklisted 
                                            ? "bg-gray-600 hover:bg-gray-500 text-white" 
                                            : "bg-red-600 hover:bg-red-500 text-white"
                                        }`}
                                    >
                                        {user.isBlacklisted ? "Unban" : "Blacklist"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div className="p-8 text-center text-gray-500">No users found.</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;