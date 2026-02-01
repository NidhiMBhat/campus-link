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
    // MAIN CONTAINER: Matte Campus Background
    <div className="app-canvas min-h-screen w-full p-6 font-mono">
      
      <div className="max-w-2xl mx-auto flex flex-col">
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

        {/* Title */}
        <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">
                My Requests
            </h1>
            <div className="bg-[#CBD5E1] px-2 py-1 mt-2 inline-block border-l-4 border-[#3C4142]">
                <p className="text-black text-xs font-extrabold uppercase tracking-wide">
                    Manage your active orders
                </p>
            </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#3C4142] border-t-transparent rounded-none animate-spin mb-4"></div>
              <p className="text-[#3C4142] text-sm font-black uppercase">Loading...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-6 pb-20">
            {requests.map(task => {
              const expired = task.status === "pending" && isExpired(task.createdAt, task.time);
              return (
              <div
                key={task.id}
                // Matte Campus Card
                className="relative mc-panel p-6 shadow-[4px_4px_0px_0px_#3C4142] transition-all hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-lg font-black text-black uppercase tracking-wide mb-1">
                        {task.type}
                    </h2>
                    <p className="text-[#3C4142] text-xs font-extrabold font-mono border-l-2 border-[#3C4142] pl-2">
                        "{task.desc}"
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className={`border-2 border-[#3C4142] px-2 py-1 flex items-center gap-2 shadow-[2px_2px_0px_#3C4142] ${
                      task.status === 'accepted' 
                      ? 'bg-[#B8C6A5] text-black' 
                      : 'bg-[#e0beb3] text-black'
                  }`}>
                    {expired ? <AlertCircle size={14} /> : task.status === 'accepted' ? <div className="w-2 h-2 bg-black animate-pulse"></div> : <Loader2 size={14} className="animate-spin" />}
                    <span className="text-[10px] uppercase font-black tracking-widest">
                       {expired ? "EXPIRED" : task.status}
                    </span>
                  </div>
                </div>

                {/* Expiration Message */}
                {expired && (
                    <div className="bg-[#e0beb3] border-2 border-[#3C4142] p-2 mb-4 text-black text-xs font-black uppercase tracking-wide flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>Task Expired: No one accepted.</span>
                    </div>
                )}

                {/* Details Section */}
                <div className="bg-[#CBD5E1] border-2 border-[#3C4142] p-4 space-y-3 mb-6 shadow-[2px_2px_0px_0px_#3C4142]">
                  <div className="flex items-center text-black text-xs font-extrabold font-mono">
                    <MapPin size={14} className="text-[#e0beb3] mr-2" />
                    <span className="text-[#3C4142] mr-1 uppercase">From:</span> {task.source?.name}
                  </div>
                  <div className="flex items-center text-black text-xs font-extrabold font-mono">
                    <MapPin size={14} className="text-[#B8C6A5] mr-2" />
                    <span className="text-[#3C4142] mr-1 uppercase">To:</span> {task.dest?.name}
                  </div>
                  <div className="flex items-center text-black text-xs font-extrabold font-mono">
                    <Clock size={14} className="text-[#e0beb3] mr-2" />
                    <span className="text-[#3C4142] mr-1 uppercase">Time:</span> {task.time}
                  </div>
                </div>

                {/* ACCEPTED STATE: Contact & Actions */}
                {task.status === "accepted" && (
                  <div className="bg-white border-2 border-[#3C4142] p-4 mb-6 shadow-[2px_2px_0px_#3C4142]">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="text-[#3C4142] text-[10px] uppercase font-black tracking-wider mb-1">Assigned Helper</p>
                        <p className="text-black font-black text-sm uppercase">{task.helperName || "Unknown"}</p>
                        <p className="text-[#3C4142] text-xs font-mono">{task.helperPhone || "No Contact"}</p>
                      </div>
                      <a href={`tel:${task.helperPhone}`} className="bg-[#CBD5E1] p-2 border-2 border-[#3C4142] hover:bg-[#B8C6A5] active:translate-y-1 shadow-[2px_2px_0px_#3C4142]">
                        <Phone size={18} className="text-black" />
                      </a>
                    </div>
                  
                    {/* CONFIRM BUTTON */}
                    <button
                      onClick={() => handleCompleteTask(task)}
                      disabled={task.requesterConfirmed || processingId === task.id}
                      className={`w-full py-3 border-4 border-[#3C4142] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all
                        ${task.requesterConfirmed 
                          ? "bg-[#CBD5E1] text-[#3C4142] cursor-not-allowed shadow-none" 
                          : "mc-button-green text-black shadow-[4px_4px_0px_0px_#3C4142] hover:brightness-105 active:translate-y-1 active:shadow-none"
                        }`}
                    >
                      {processingId === task.id ? "Processing..." : 
                       task.requesterConfirmed ? (
                         <> <CheckCircle size={16} /> Waiting for Helper...</>
                       ) : "Confirm Items Received"}
                    </button>
                    
                    {task.helperConfirmed && !task.requesterConfirmed && (
                      <div className="mt-3 bg-[#e0beb3] border-2 border-[#3C4142] p-2 flex items-center justify-center gap-2 animate-pulse">
                          <div className="w-2 h-2 bg-black"></div>
                          <p className="text-xs text-black font-black uppercase tracking-wide">
                            Helper marked as done. Confirm now!
                          </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="border-t-2 border-[#3C4142] border-dashed pt-4 flex justify-between items-center">
                  <div>
                    <p className="text-[#3C4142] text-[10px] uppercase tracking-wider font-black">Reward</p>
                    <p className="text-lg font-black text-black">{task.credits} Cr</p>
                  </div>

                  {/* CANCEL BUTTON */}
                  <button
                    onClick={() => handleCancel(task.id)}
                    className="flex items-center gap-2 mc-button-pink border-2 border-[#3C4142] text-black px-4 py-2 text-xs font-black uppercase tracking-wide shadow-[2px_2px_0px_#3C4142] active:translate-y-1 active:shadow-none transition-all"
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
          <div className="flex-1 flex flex-col items-center justify-center mc-panel p-10 text-center min-h-[300px] shadow-[4px_4px_0px_0px_#3C4142]">
            <div className="bg-[#CBD5E1] p-4 border-2 border-[#3C4142] mb-6 shadow-[2px_2px_0px_0px_#3C4142]">
              <FolderOpen size={48} className="text-black" />
            </div>
            <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">No Active Requests</h3>
            <p className="text-[#3C4142] text-xs font-extrabold mb-6 max-w-xs">
                Your request list is empty. Post a request to get help from other students.
            </p>
            <button
              onClick={() => navigate("/request")}
              className="mc-button-green text-black px-6 py-3 border-4 border-[#3C4142] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#3C4142] active:translate-y-1 active:shadow-none transition-all"
            >
              Create New Request
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRequests;