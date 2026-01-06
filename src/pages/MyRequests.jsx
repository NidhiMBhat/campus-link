import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderOpen,
  Clock,
  MapPin,
  Loader2,
  Trash2,
  CheckCircle,
  Phone,
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
  const [processingId, setProcessingId] = useState(null);

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
        where("requesterId", "==", user.uid),
        where("status", "in", ["pending", "accepted"])
      );

      const snap = await getDocs(q);
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchRequests();
  }, [user]);

  const handleCompleteTask = async (task) => {
    setProcessingId(task.id);
    try {
      await completeTask(task, "requester");
      alert("Task completed! Credits transferred.");
      setActiveRequest(null);
    } catch (err) {
      alert(err.message);
    }
    finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (taskId) => {
    if (!window.confirm("Cancel this request?")) return;
    await deleteDoc(doc(db, "requests", taskId));
    setRequests(prev => prev.filter(t => t.id !== taskId));
  };

  return (
    // MAIN CONTAINER
    <div className="min-h-screen w-full relative">
      
      {/* 1. FIXED BACKGROUND LAYER (Deep Gray Gradient) */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-[#050505]"></div>

      {/* 2. CONTENT CONTAINER */}
      <div className="p-6 max-w-2xl mx-auto flex flex-col">
        <button
          onClick={() => navigate("/home")}
          className="mb-8 flex items-center text-gray-400 hover:text-white transition group w-fit"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back
        </button>

        <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400">
                My Requests
            </h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-6 animate-fade-in pb-20">
            {requests.map(task => (
              <div
                key={task.id}
                // GLASSMORPHISM CARD STYLE
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {task.title}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 font-light">{task.description}</p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 uppercase tracking-wide shadow-lg border ${
                      task.status === 'accepted' 
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                      : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                  }`}>
                    {task.status === 'accepted' ? (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
                    ) : (
                        <Loader2 size={12} className="animate-spin" />
                    )}
                    {task.status || "pending"}
                  </span>
                </div>

                {/* Details Section - LAYOUT KEPT EXACTLY AS REQUESTED */}
                {/* Just updated bg color to black/20 to fit the glass theme */}
                <div className="bg-black/20 rounded-xl p-4 space-y-3 mb-6 border border-white/5">
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin size={16} className="text-indigo-400 mr-2" />
                    <span className="text-gray-500 mr-1">From:</span> {task.source.name}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <MapPin size={16} className="text-emerald-400 mr-2" />
                    <span className="text-gray-500 mr-1">To:</span> {task.dest.name}
                  </div>
                  <div className="flex items-center text-gray-300 text-sm">
                    <Clock size={16} className="text-orange-400 mr-2" />
                    <span className="text-gray-500 mr-1">Time:</span> {task.time}
                  </div>
                </div>

                {task.status === "accepted" && (
                  <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 mb-6 space-y-5 backdrop-blur-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-indigo-300 text-[10px] uppercase font-bold tracking-wider">Deliverer Contact</p>
                        <p className="text-white font-medium">{task.helperName || "Assigned Helper"}</p>
                        <p className="text-indigo-300/70 text-xs">{task.helperPhone || "Contact via App"}</p>
                      </div>
                      <a href={`tel:${task.helperPhone}`} className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 active:scale-95">
                        <Phone size={18} className="text-white" />
                      </a>
                    </div>
                  
                    <button
                      onClick={() => handleCompleteTask(task)}
                      disabled={task.requesterConfirmed || processingId === task.id}
                      className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        task.requesterConfirmed 
                        ? "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600" 
                        : "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-emerald-600/20 active:scale-[0.98]"
                      }`}
                    >
                      {processingId === task.id ? <Loader2 size={20} className="animate-spin" /> : 
                       task.requesterConfirmed ? (
                         <> <CheckCircle size={20} /> Waiting for Deliverer...</>
                       ) : "Confirm I Received Items"}
                    </button>
                    
                    {task.helperConfirmed && !task.requesterConfirmed && (
                      <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center justify-center gap-2 animate-pulse">
                         <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                         <p className="text-xs text-amber-200 font-medium">
                           The deliverer has marked this as finished. Please confirm!
                         </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t border-white/10 pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-medium">Credits Offered</p>
                    <p className="text-lg font-bold text-white">{task.credits} Cr</p>
                  </div>

                  <button
                    onClick={() => handleCancel(task.id)}
                    className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/10 hover:border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl transition text-sm font-medium"
                  >
                    <Trash2 size={16} /> Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State - Enhanced */
          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl p-10 text-center min-h-[400px]">
            <div className="bg-gray-800/50 p-6 rounded-full mb-6 shadow-inner border border-white/5">
              <FolderOpen size={48} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No active requests</h3>
            <button
              onClick={() => navigate("/request")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 mt-4"
            >
              Create a Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;