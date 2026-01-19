import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coffee, MapPin, Clock, ArrowRight, CheckCircle } from "lucide-react"; 
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { createNotification } from "../services/notifications";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Controls the success popup
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const currentUserId = auth.currentUser?.uid;

  const getDurationMs = (timeStr) => {
    const val = parseInt(timeStr);
    if (timeStr.includes("Hour")) return val * 60 * 60 * 1000;
    return val * 60 * 1000; // default to minutes
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, "requests"),
          where("status", "==", "pending")
        );
        const now = Date.now();
        const snap = await getDocs(q);
        const fetchedTasks = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((task) => {
            // If there's no timestamp, keep it (safety)
            if (!task.createdAt) return true;

            const createdTime = task.createdAt.toMillis();
            const expiryDuration = getDurationMs(task.time);
            
            // Return true only if current time is less than creation + duration
            return now < createdTime + expiryDuration;
          });

        setTasks(fetchedTasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleAcceptTask = async (task) => {
    const user = auth.currentUser;
    if (!user) return;

    const now = Date.now() ;
    const expiryTime = task.createdAt.toMillis() + getDurationMs(task.time);
    if (now > expiryTime) {
      alert("This task has expired and is no longer available.");
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      return;
    }
    try {
      // 1. Get ALL currently active tasks for this helper
      const activeTaskQuery = query(
        collection(db, "requests"),
        where("helperId", "==", user.uid),
        where("status", "==", "accepted")
      );
      const activeTaskSnap = await getDocs(activeTaskQuery);
      const activeTasks = activeTaskSnap.docs.map(d => d.data());

      // --- STRICT POOLING LOGIC START ---
      // If user already has active tasks, apply strict rules
      if (activeTasks.length > 0) {
        const currentBatchSource = activeTasks[0].source?.name; 
        const currentBatchDest = activeTasks[0].dest?.name; 
        
        // Rule A: Max Limit (e.g., 3 tasks max)
        if (activeTasks.length >= 3) {
           alert("Pool full! You can only pool up to 3 tasks at a time.");
           return;
        }

        // Rule B: EXACT Route Matching (Source AND Destination must match)
        // This prevents helpers from accepting tasks going to different locations
        const isSameSource = task.source?.name === currentBatchSource;
        const isSameDest = task.dest?.name === currentBatchDest;

        if (!isSameSource || !isSameDest) {
           alert(`Pooling Restriction: You are currently doing a run from "${currentBatchSource}" to "${currentBatchDest}". \n\nTo ensure efficiency, you can only pool tasks that follow this EXACT same route.`);
           return;
        }
      }
      // --- POOLING LOGIC END ---

      // 2. Update Firestore
      await updateDoc(doc(db, "requests", task.id), {
        status: "accepted",
        helperId: user.uid,
        helperName: user.displayName || "Peer Helper",
        helperPhone: user.phoneNumber || "",
        requesterConfirmed: false,
        helperConfirmed: false,
      });

      // 3. Send Notification
      if (task.requesterId) {
        try {
            await createNotification({
              userId: task.requesterId,
              message: "Your request was accepted (Pooled Delivery)!",
              requestId: task.id,
            });
        } catch (notifErr) {
            console.warn("Notification failed, but task accepted:", notifErr);
        }
      }

      // 4. Update UI instantly (Remove from list)
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      
      // 5. SHOW SUCCESS POPUP instead of navigating immediately
      setShowSuccessModal(true);

      // 6. Navigate after 2 seconds
      setTimeout(() => {
        navigate("/my-tasks");
      }, 2000);

    } catch (err) {
      console.error("Accept Logic Error:", err);
      alert("Failed to accept task");
    }
  };

  return (
    // MAIN CONTAINER
    <div className="min-h-screen w-full relative">
      
      {/* 1. FIXED BACKGROUND LAYER */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-[#050505]"></div>

      {/* --- SUCCESS MODAL POPUP --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-gray-900 border border-emerald-500/50 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-sm w-full transform scale-105 transition-transform">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <CheckCircle size={40} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Task Accepted!</h2>
            <p className="text-gray-400 mb-6">Redirecting you to the active task window...</p>
            
            {/* Loading Bar */}
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 animate-[loading_2s_ease-in-out_forwards] w-0"></div>
            </div>
          </div>
        </div>
      )}

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
                Available Tasks
            </h1>
            <p className="text-gray-400 mt-2">Earn credits by helping your peers.</p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm">Scanning for requests...</p>
            </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-6 animate-fade-in pb-20">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:border-indigo-500/30 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gray-800/50 rounded-2xl border border-white/5 group-hover:border-indigo-500/30 transition-colors shadow-inner">
                      <Coffee size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {task.type}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <p className="text-xs text-gray-400 font-mono uppercase tracking-wide">
                            REQ: {task.requesterName}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    {task.credits || 0} Cr
                  </span>
                </div>

                <p className="text-gray-300 mb-6 bg-black/20 border border-white/5 p-4 rounded-xl text-sm leading-relaxed">
                  {task.desc}
                </p>

                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-800/30 p-3 rounded-xl border border-white/5 hover:bg-gray-800/50 transition-colors">
                    <MapPin size={16} className="text-indigo-400" /> 
                    <span className="text-gray-500">From:</span> 
                    <span className="text-gray-200">{task.source?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-800/30 p-3 rounded-xl border border-white/5 hover:bg-gray-800/50 transition-colors">
                    <MapPin size={16} className="text-emerald-400" /> 
                    <span className="text-gray-500">To:</span> 
                    <span className="text-gray-200">{task.dest?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400">
                  <Clock size={16} /> 
                  <span className="text-gray-500">Expires in:</span> 
                  {Math.round(((task.createdAt.toMillis() + getDurationMs(task.time)) - Date.now()) / 60000)} mins
                </div>
                </div>

                {task.requesterId !== currentUserId ? (
                  <button
                    onClick={() => handleAcceptTask(task)}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2 border border-emerald-500/20"
                  >
                    Accept Task <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className="w-full py-3 rounded-xl border border-gray-700 bg-gray-800/50 text-center">
                    <p className="text-sm text-gray-500 italic">
                      You can’t accept your own request
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm border border-white/5 rounded-3xl p-10 text-center min-h-[400px]">
            <div className="bg-gray-800/50 p-6 rounded-full mb-6 shadow-inner border border-white/5">
              <Coffee size={48} className="text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">All caught up!</h3>
            <p className="text-gray-500 mt-2 max-w-xs mx-auto">
              There are no pending tasks right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;