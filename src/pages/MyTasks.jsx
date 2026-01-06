import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen, Loader2, CheckCircle, Phone, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { completeTask } from "../services/completeTask";
import { collection, query, where, onSnapshot } from "firebase/firestore";

const MyTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Use onSnapshot for real-time updates on confirmation status
    const q = query(
      collection(db, "requests"),
      where("helperId", "==", user.uid),
      where("status", "in", ["Accepted", "accepted"]) // Handle both cases just in case
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Snapshot error:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleCompleteSignal = async (task) => {
    if (!task || !task.id) return;
    
    setProcessingId(task.id);
    try {
      // Pass the task object and the role as "helper"
      await completeTask(task, "helper");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    // MAIN CONTAINER
    <div className="min-h-screen w-full relative">
      
      {/* 1. FIXED BACKGROUND LAYER */}
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
                Tasks I'm Helping With
            </h1>
            <p className="text-gray-400 mt-2">Manage your accepted commitments.</p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Loading your tasks...</p>
            </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-6 animate-fade-in pb-20">
            {tasks.map(task => (
              <div 
                key={task.id} 
                // GLASSMORPHISM CARD STYLE
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white group-hover:text-indigo-200 transition-colors">
                        {task.type}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 font-light leading-relaxed">
                        {task.desc}
                    </p>
                  </div>
                  <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                    {task.status}
                  </span>
                </div>

                {/* Requester Contact Info - Styled as "Active Connection" */}
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5 mb-6 space-y-4 backdrop-blur-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                             <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-indigo-200 text-[10px] uppercase font-bold tracking-wider">Requester Details</p>
                            <p className="text-white font-medium">{task.requesterName}</p>
                            <p className="text-indigo-300/70 text-xs">{task.requesterPhone || "No phone provided"}</p>
                        </div>
                    </div>
                    {task.requesterPhone && (
                      <a 
                        href={`tel:${task.requesterPhone}`} 
                        className="bg-indigo-600 p-3 rounded-xl hover:bg-indigo-500 transition shadow-lg shadow-indigo-600/20 active:scale-95"
                      >
                        <Phone size={18} className="text-white" />
                      </a>
                    )}
                  </div>
                  
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin size={16} className="mr-2.5 text-indigo-400" /> 
                      <span className="text-gray-500 mr-1">From:</span> {task.source?.name}
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <MapPin size={16} className="mr-2.5 text-emerald-400" /> 
                      <span className="text-gray-500 mr-1">To:</span> {task.dest?.name}
                    </div>
                  </div>
                </div>

                {/* Helper Confirmation Button */}
                <button
                  onClick={() => handleCompleteSignal(task)}
                  disabled={task.helperConfirmed || processingId === task.id}
                  className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                    task.helperConfirmed 
                    ? "bg-gray-700/50 text-gray-400 cursor-not-allowed border border-gray-600" 
                    : "bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-indigo-600/20 active:scale-[0.98]"
                  }`}
                >
                  {processingId === task.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : task.helperConfirmed ? (
                    <> <CheckCircle size={20} /> Waiting for Requester...</>
                  ) : (
                    "Confirm I've Delivered"
                  )}
                </button>

                {task.requesterConfirmed && !task.helperConfirmed && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center justify-center gap-2 mt-4 animate-pulse">
                     <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                     <p className="text-xs text-emerald-200 font-medium">
                       The requester has confirmed receipt! Click the button above to finish.
                     </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-gray-500 text-xs italic">Reward on completion:</span>
                  <span className="text-emerald-400 font-bold text-lg">{task.credits} Cr</span>
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
            <h3 className="text-xl font-bold text-white mb-2">No active tasks</h3>
            <p className="text-gray-500 max-w-xs mx-auto mb-6">
                You haven't accepted any errands. Go to the Tasks page to find someone to help!
            </p>
            <button
              onClick={() => navigate("/tasks")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              Find Tasks
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;