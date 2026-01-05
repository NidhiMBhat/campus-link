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
    <div className="min-h-screen p-6 max-w-2xl mx-auto flex flex-col">
      <button
        onClick={() => navigate("/home")}
        className="mb-6 flex items-center text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={20} className="mr-2" /> Back
      </button>

      <h1 className="text-2xl font-bold text-white mb-6">Tasks I'm Helping With</h1>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : tasks.length > 0 ? (
        tasks.map(task => (
          <div key={task.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">{task.type}</h2>
                <p className="text-gray-400 text-sm mt-1">{task.desc}</p>
              </div>
              <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {task.status}
              </span>
            </div>

            {/* Requester Contact Info */}
            <div className="bg-gray-900/50 rounded-xl p-4 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-indigo-400 text-[10px] uppercase font-bold">Requester Details</p>
                  <p className="text-white font-medium">{task.requesterName}</p>
                  <p className="text-gray-400 text-sm">{task.requesterPhone || "No phone provided"}</p>
                </div>
                {task.requesterPhone && (
                  <a href={`tel:${task.requesterPhone}`} className="bg-indigo-600 p-2 rounded-full text-white">
                    <Phone size={18} />
                  </a>
                )}
              </div>
              <div className="border-t border-gray-700 pt-3 space-y-2">
                <div className="flex items-center text-sm text-gray-300">
                  <MapPin size={14} className="mr-2 text-indigo-400" /> From: {task.source?.name}
                </div>
                <div className="flex items-center text-sm text-gray-300">
                  <MapPin size={14} className="mr-2 text-emerald-400" /> To: {task.dest?.name}
                </div>
              </div>
            </div>

            {/* Helper Confirmation Button */}
            <button
              onClick={() => handleCompleteSignal(task)}
              disabled={task.helperConfirmed || processingId === task.id}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${
                task.helperConfirmed 
                ? "bg-gray-700 text-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20"
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
              <p className="text-xs text-center text-emerald-400 mt-3 animate-pulse font-medium">
                The requester has confirmed receipt! Click the button above to finish.
              </p>
            )}

            <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center">
              <span className="text-gray-500 text-xs italic">Reward on completion:</span>
              <span className="text-emerald-400 font-bold">{task.credits} Cr</span>
            </div>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-800/30 rounded-2xl p-8 text-center min-h-[400px]">
          <FolderOpen size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No active tasks</h3>
          <p className="text-gray-500 max-w-xs">You haven't accepted any errands. Go to the Tasks page to find someone to help!</p>
        </div>
      )}
    </div>
  );
};

export default MyTasks;