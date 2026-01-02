import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  Clock,
  MapPin,
  Loader2,
  Trash2,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { completeTask } from "../services/completeTask";

import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";

const MyRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeRequest, setActiveRequest] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("my_active_request");
    if (saved) {
      setActiveRequest(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;

      const q = query(
        collection(db, "requests"),
        where("requesterId", "==", user.uid)
      );

      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  const handleCompleteTask = async () => {
    try {
      await completeTask(activeRequest.id);
      alert("Task completed! Credits transferred.");
      setActiveRequest(null);
    } catch (err) {
      alert(err.message);
    }
  };
  

  const handleCancel = async (taskId) => {
    if (!window.confirm("Cancel this request?")) return;
    await deleteDoc(doc(db, "requests", taskId));
    setRequests(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col">
      <button
        onClick={() => navigate("/home")}
        className="mb-6 flex items-center text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">My Requests</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : requests.length > 0 ? (
        requests.map(task => (
          <div
            key={task.id}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl mb-4"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{task.title}</h2>
                <p className="text-gray-400 text-sm mt-1">{task.description}</p>
              </div>

              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" />
                {task.status || "pending"}
              </span>
            </div>

            {/* Details */}
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 mb-4">
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin size={16} className="text-indigo-400 mr-2" />
                From: {task.source.name}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <MapPin size={16} className="text-emerald-400 mr-2" />
                To: {task.dest.name}
              </div>
              <div className="flex items-center text-gray-300 text-sm">
                <Clock size={16} className="text-orange-400 mr-2" />
                Time: {task.time}
              </div>
            </div>
            {activeRequest.status === "Accepted" && (
            <button
              onClick={handleCompleteTask}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold"
            >
              Mark as Completed
            </button>
          )}


            {/* Footer */}
            <div className="border-t border-gray-700 pt-4 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Credits Offered</p>
                <p className="text-lg font-bold text-white">{task.credits} Cr</p>
              </div>

              <button
                onClick={() => handleCancel(task.id)}
                className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-lg"
              >
                <Trash2 size={16} /> Cancel
              </button>
            </div>
          </div>
        ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/30 rounded-2xl p-8 text-center min-h-[400px]">
          <FolderOpen size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No requests yet</h3>
          <button
            onClick={() => navigate("/request")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-xl"
          >
            Create a Request
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
