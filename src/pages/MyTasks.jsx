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
    // MAIN CONTAINER: Dark Cubes Background
    <div className="min-h-screen w-full font-mono bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* 2. CONTENT CONTAINER */}
      <div className="p-6 max-w-2xl mx-auto flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="mb-8 flex items-center text-white hover:text-yellow-400 transition group w-fit"
        >
          <div className="bg-[#555] p-1 border-2 border-black group-active:translate-y-1 mr-2">
             <ArrowLeft size={20} />
          </div>
          <span className="uppercase font-bold tracking-widest text-xs shadow-black drop-shadow-md">Back to Menu</span>
        </button>

        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:3px_3px_#000]">
                My Jobs
            </h1>
            <div className="bg-[#00000080] px-2 py-1 mt-2 inline-block border-l-4 border-[#555]">
                <p className="text-gray-300 text-xs font-bold uppercase tracking-wide">
                    Tasks you have accepted
                </p>
            </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-none animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm font-bold uppercase">Loading Inventory...</p>
            </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-6 pb-20">
            {tasks.map(task => (
              <div 
                key={task.id} 
                // MINECRAFT CARD: Stone Panel
                className="relative bg-[#C6C6C6] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#333] uppercase tracking-wide mb-1">
                        {task.type}
                    </h2>
                    <p className="text-[#555] text-xs font-bold font-mono border-l-2 border-[#777] pl-2 leading-relaxed">
                        "{task.desc}"
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="bg-[#3c8527] border-2 border-black px-2 py-1 text-white text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_#000]">
                    {task.status}
                  </div>
                </div>

                {/* Requester Contact Info - Styled as "Iron Panel" */}
                <div className="bg-[#A2B9C4] border-2 border-black p-4 mb-6 shadow-[2px_2px_0px_#000]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-black bg-[#5D737E] flex items-center justify-center text-white shadow-[inset_2px_2px_0px_#A2B9C4]">
                             <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-[#333] text-[10px] uppercase font-bold tracking-wider">Requester</p>
                            <p className="text-black font-bold text-sm uppercase">{task.requesterName}</p>
                            <p className="text-[#555] text-xs font-mono">{task.requesterPhone || "No Phone"}</p>
                        </div>
                    </div>
                    {task.requesterPhone && (
                      <a 
                        href={`tel:${task.requesterPhone}`} 
                        className="bg-[#3c8527] p-2 border-2 border-black hover:bg-[#4ca633] transition active:translate-y-1 shadow-[2px_2px_0px_#000]"
                      >
                        <Phone size={18} className="text-white" />
                      </a>
                    )}
                  </div>
                  
                  {/* Location Details */}
                  <div className="bg-[#8B8B8B] border-2 border-black p-3 space-y-2 shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
                    <div className="flex items-center text-xs font-bold font-mono text-white">
                      <MapPin size={14} className="mr-2 text-[#FCD34D]" /> 
                      <span className="text-[#DDD] mr-1 uppercase">From:</span> {task.source?.name}
                    </div>
                    <div className="flex items-center text-xs font-bold font-mono text-white">
                      <MapPin size={14} className="mr-2 text-[#39ff14]" /> 
                      <span className="text-[#DDD] mr-1 uppercase">To:</span> {task.dest?.name}
                    </div>
                  </div>
                </div>

                {/* Helper Confirmation Button (Emerald) */}
                <button
                  onClick={() => handleCompleteSignal(task)}
                  disabled={task.helperConfirmed || processingId === task.id}
                  className={`w-full py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-4 border-black
                    ${task.helperConfirmed 
                      ? "bg-[#555] text-gray-400 cursor-not-allowed shadow-none" 
                      : "bg-[#3c8527] text-white shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513] hover:bg-[#4ca633] active:translate-y-1"
                    }`}
                >
                  {processingId === task.id ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : task.helperConfirmed ? (
                    <> <CheckCircle size={16} /> Waiting for Requester...</>
                  ) : (
                    "Confirm I've Delivered"
                  )}
                </button>

                {task.requesterConfirmed && !task.helperConfirmed && (
                  <div className="bg-[#FCD34D] border-2 border-black p-2 flex items-center justify-center gap-2 mt-4 animate-pulse">
                      <div className="w-2 h-2 bg-black"></div>
                      <p className="text-xs text-black font-bold uppercase tracking-wide">
                        Requester confirmed receipt! Click above to finish.
                      </p>
                  </div>
                )}

                {/* Footer Reward */}
                <div className="mt-4 pt-4 border-t-2 border-[#777] border-dashed flex justify-between items-center">
                  <span className="text-[#555] text-[10px] font-bold uppercase tracking-wider">Reward</span>
                  <span className="text-[#3c8527] font-bold text-lg">{task.credits} Cr</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#C6C6C6] border-4 border-black p-10 text-center min-h-[300px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#8B8B8B] p-4 border-2 border-black mb-6 shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
              <FolderOpen size={48} className="text-[#333]" />
            </div>
            <h3 className="text-lg font-bold text-[#333] mb-2 uppercase tracking-wide">Inventory Empty</h3>
            <p className="text-[#555] text-xs font-bold font-mono">
                You are not helping anyone right now.
            </p>
            <button
              onClick={() => navigate("/tasks")}
              className="mt-6 bg-[#3c8527] hover:bg-[#4ca633] text-white px-6 py-3 border-4 border-black font-bold uppercase tracking-widest shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513] active:translate-y-1 transition-all"
            >
              Find a Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;