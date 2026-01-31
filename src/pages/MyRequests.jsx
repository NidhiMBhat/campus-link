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
  AlertCircle
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

  const isExpired = (createdAt, timeStr) => {
    if (!createdAt) return false;
    const val = parseInt(timeStr);
    const durationMs = timeStr.includes("Hour") ? val * 3600000 : val * 60000;
    return Date.now() > createdAt.toMillis() + durationMs;
  };
  
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
      
      // Remove from list immediately
      setRequests(prev => prev.filter(t => t.id !== task.id));
      
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
    // MAIN CONTAINER: Dark Cubes Background
    <div className="min-h-screen w-full p-6 font-mono bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      <div className="max-w-2xl mx-auto flex flex-col">
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

        {/* Title */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:3px_3px_#000]">
                My Quests
            </h1>
            <div className="bg-[#00000080] px-2 py-1 mt-2 inline-block border-l-4 border-[#555]">
                <p className="text-gray-300 text-xs font-bold uppercase tracking-wide">
                    Manage your active orders
                </p>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-none animate-spin mb-4"></div>
              <p className="text-gray-400 text-sm font-bold uppercase">Loading World...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-6 pb-20">
            {requests.map(task => {
              const expired = task.status === "pending" && isExpired(task.createdAt, task.time);
              return (
              <div
                key={task.id}
                // MINECRAFT CARD: Stone Panel
                className="relative bg-[#C6C6C6] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#333] uppercase tracking-wide mb-1">
                        {task.type} {/* Changed from task.title to task.type as per your previous schema */}
                    </h2>
                    <p className="text-[#555] text-xs font-bold font-mono border-l-2 border-[#777] pl-2">
                        "{task.desc}" {/* Changed from task.description */}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`border-2 border-black px-2 py-1 flex items-center gap-2 shadow-[2px_2px_0px_#000] ${
                      task.status === 'accepted' 
                      ? 'bg-[#3c8527] text-white' 
                      : 'bg-[#FCD34D] text-black'
                  }`}>
                    {expired ? <AlertCircle size={14} /> : task.status === 'accepted' ? <div className="w-2 h-2 bg-white animate-pulse"></div> : <Loader2 size={14} className="animate-spin" />}
                    <span className="text-[10px] uppercase font-bold tracking-widest">
                       {expired ? "EXPIRED" : task.status}
                    </span>
                  </div>
                </div>

                {/* Expiration Message */}
                {expired && (
                    <div className="bg-[#A32222] border-2 border-black p-2 mb-4 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>Quest Expired: No players accepted.</span>
                    </div>
                )}

                {/* Details Section (Dark Slot) */}
                <div className="bg-[#8B8B8B] border-2 border-black p-4 space-y-3 mb-6 shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
                  <div className="flex items-center text-white text-xs font-bold font-mono">
                    <MapPin size={14} className="text-[#FCD34D] mr-2" />
                    <span className="text-[#DDD] mr-1 uppercase">From:</span> {task.source?.name}
                  </div>
                  <div className="flex items-center text-white text-xs font-bold font-mono">
                    <MapPin size={14} className="text-[#39ff14] mr-2" />
                    <span className="text-[#DDD] mr-1 uppercase">To:</span> {task.dest?.name}
                  </div>
                  <div className="flex items-center text-white text-xs font-bold font-mono">
                    <Clock size={14} className="text-orange-400 mr-2" />
                    <span className="text-[#DDD] mr-1 uppercase">Time:</span> {task.time}
                  </div>
                </div>

                {/* ACCEPTED STATE: Contact & Actions */}
                {task.status === "accepted" && (
                  <div className="bg-[#A2B9C4] border-2 border-black p-4 mb-6 shadow-[2px_2px_0px_#000]">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[#333] text-[10px] uppercase font-bold tracking-wider mb-1">Assigned Player</p>
                        <p className="text-black font-bold text-sm uppercase">{task.helperName || "Unknown"}</p>
                        <p className="text-[#555] text-xs font-mono">{task.helperPhone || "No Contact"}</p>
                      </div>
                      <a href={`tel:${task.helperPhone}`} className="bg-[#5D737E] p-2 border-2 border-black hover:bg-[#6D838E] active:translate-y-1 shadow-[2px_2px_0px_#000]">
                        <Phone size={18} className="text-white" />
                      </a>
                    </div>
                  
                    {/* CONFIRM BUTTON (Emerald) */}
                    <button
                      onClick={() => handleCompleteTask(task)}
                      disabled={task.requesterConfirmed || processingId === task.id}
                      className={`w-full py-3 border-4 border-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                        ${task.requesterConfirmed 
                          ? "bg-[#555] text-gray-400 cursor-not-allowed shadow-none" 
                          : "bg-[#3c8527] text-white shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513] hover:bg-[#4ca633] active:translate-y-1"
                        }`}
                    >
                      {processingId === task.id ? "Processing..." : 
                       task.requesterConfirmed ? (
                         <> <CheckCircle size={16} /> Waiting for Player...</>
                       ) : "Confirm Items Received"}
                    </button>
                    
                    {task.helperConfirmed && !task.requesterConfirmed && (
                      <div className="mt-3 bg-[#FCD34D] border-2 border-black p-2 flex items-center justify-center gap-2 animate-pulse">
                          <div className="w-2 h-2 bg-black"></div>
                          <p className="text-xs text-black font-bold uppercase tracking-wide">
                            Player marked as done. Confirm now!
                          </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t-2 border-[#777] border-dashed pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[#555] text-[10px] uppercase tracking-wider font-bold">Reward</p>
                    <p className="text-lg font-bold text-[#333]">{task.credits} Cr</p>
                  </div>

                  {/* CANCEL BUTTON (Redstone) */}
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="flex items-center gap-2 bg-[#A32222] hover:bg-[#C42C2C] border-2 border-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wide shadow-[2px_2px_0px_#500] active:translate-y-1 active:shadow-none transition-all"
                  >
                    <Trash2 size={14} /> {expired ? "Remove" : "Cancel"}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#C6C6C6] border-4 border-black p-10 text-center min-h-[300px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#8B8B8B] p-4 border-2 border-black mb-6 shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
              <FolderOpen size={48} className="text-[#333]" />
            </div>
            <h3 className="text-lg font-bold text-[#333] mb-2 uppercase tracking-wide">No Active Quests</h3>
            <p className="text-[#555] text-xs font-bold mb-6 max-w-xs">
                Your quest log is empty. Post a request to get help from other players.
            </p>
            <button
              onClick={() => navigate("/request")}
              className="bg-[#3c8527] hover:bg-[#4ca633] text-white px-6 py-3 border-4 border-black font-bold uppercase tracking-widest shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513] active:translate-y-1 transition-all"
            >
              Start New Quest
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;