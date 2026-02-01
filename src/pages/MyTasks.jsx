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
    // MAIN CONTAINER: Matte Campus Background
    <div className="app-canvas min-h-screen w-full font-mono">
      
      {/* 2. CONTENT CONTAINER */}
      <div className="p-6 max-w-2xl mx-auto flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="mb-8 flex items-center text-[#3C4142] hover:text-black transition group w-fit"
        >
          <div className="bg-[#CBD5E1] p-1 border-2 border-[#3C4142] group-active:translate-y-1 mr-2 shadow-[2px_2px_0px_0px_#3C4142]">
             <ArrowLeft size={20} />
          </div>
          <span className="uppercase font-black tracking-widest text-xs">Back to Menu</span>
        </button>

        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">
                My Tasks
            </h1>
            <div className="bg-[#CBD5E1] px-2 py-1 mt-2 inline-block border-l-4 border-[#3C4142]">
                <p className="text-black text-xs font-extrabold uppercase tracking-wide">
                    Tasks you have accepted
                </p>
            </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#3C4142] border-t-transparent rounded-none animate-spin mb-4"></div>
                <p className="text-[#3C4142] text-sm font-black uppercase">Loading Tasks...</p>
            </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-6 pb-20">
            {tasks.map(task => (
              <div 
                key={task.id} 
                // Matte Campus Card
                className="relative mc-panel p-6 shadow-[4px_4px_0px_0px_#3C4142] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-black text-black uppercase tracking-wide mb-1">
                        {task.type}
                    </h2>
                    <p className="text-[#3C4142] text-xs font-extrabold font-mono border-l-2 border-[#3C4142] pl-2 leading-relaxed">
                        "{task.desc}"
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="bg-[#B8C6A5] border-2 border-[#3C4142] px-2 py-1 text-black text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#3C4142]">
                    {task.status}
                  </div>
                </div>

                {/* Requester Contact Info */}
                <div className="bg-white border-2 border-[#3C4142] p-4 mb-6 shadow-[2px_2px_0px_#3C4142]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 border-2 border-[#3C4142] bg-[#CBD5E1] flex items-center justify-center text-black">
                             <Phone size={20} />
                        </div>
                        <div>
                            <p className="text-[#3C4142] text-[10px] uppercase font-black tracking-wider">Requester</p>
                            <p className="text-black font-black text-sm uppercase">{task.requesterName}</p>
                            <p className="text-[#3C4142] text-xs font-mono">{task.requesterPhone || "No Phone"}</p>
                        </div>
                    </div>
                    {task.requesterPhone && (
                      <a 
                        href={`tel:${task.requesterPhone}`} 
                        className="bg-[#B8C6A5] p-2 border-2 border-[#3C4142] hover:brightness-105 transition active:translate-y-1 shadow-[2px_2px_0px_#3C4142]"
                      >
                        <Phone size={18} className="text-black" />
                      </a>
                    )}
                  </div>
                  
                  {/* Location Details */}
                  <div className="bg-[#CBD5E1] border-2 border-[#3C4142] p-3 space-y-2 shadow-[inset_2px_2px_0px_#ddd]">
                    <div className="flex items-center text-xs font-extrabold font-mono text-black">
                      <MapPin size={14} className="mr-2 text-[#e0beb3]" /> 
                      <span className="text-[#3C4142] mr-1 uppercase">From:</span> {task.source?.name}
                    </div>
                    <div className="flex items-center text-xs font-extrabold font-mono text-black">
                      <MapPin size={14} className="mr-2 text-[#B8C6A5]" /> 
                      <span className="text-[#3C4142] mr-1 uppercase">To:</span> {task.dest?.name}
                    </div>
                  </div>
                </div>

                {/* Helper Confirmation Button */}
                <button
                  onClick={() => handleCompleteSignal(task)}
                  disabled={task.helperConfirmed || processingId === task.id}
                  className={`w-full py-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all border-4 border-[#3C4142]
                    ${task.helperConfirmed 
                      ? "bg-[#CBD5E1] text-[#3C4142] cursor-not-allowed shadow-none" 
                      : "mc-button-green text-black shadow-[4px_4px_0px_0px_#3C4142] hover:brightness-105 active:translate-y-1 active:shadow-none"
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
                  <div className="bg-[#e0beb3] border-2 border-[#3C4142] p-2 flex items-center justify-center gap-2 mt-4 animate-pulse">
                      <div className="w-2 h-2 bg-black"></div>
                      <p className="text-xs text-black font-black uppercase tracking-wide">
                        Requester confirmed receipt! Click above to finish.
                      </p>
                  </div>
                )}

                {/* Footer Reward */}
                <div className="mt-4 pt-4 border-t-2 border-[#3C4142] border-dashed flex justify-between items-center">
                  <span className="text-[#3C4142] text-[10px] font-black uppercase tracking-wider">Reward</span>
                  <span className="text-[#B8C6A5] font-black text-lg">{task.credits} Cr</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center mc-panel p-10 text-center min-h-[300px] shadow-[4px_4px_0px_0px_#3C4142]">
            <div className="bg-[#CBD5E1] p-4 border-2 border-[#3C4142] mb-6 shadow-[2px_2px_0px_0px_#3C4142]">
              <FolderOpen size={48} className="text-black" />
            </div>
            <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">No Active Tasks</h3>
            <p className="text-[#3C4142] text-xs font-extrabold font-mono">
                You are not helping anyone right now.
            </p>
            <button
              onClick={() => navigate("/tasks")}
              className="mt-6 mc-button-green text-black px-6 py-3 border-4 border-[#3C4142] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#3C4142] active:translate-y-1 active:shadow-none transition-all"
            >
              Find a Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTasks;