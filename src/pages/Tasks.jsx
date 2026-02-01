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
    // MAIN CONTAINER: Matte Campus Background
    <div className="app-canvas min-h-screen w-full font-mono">
      
      {/* --- SUCCESS MODAL POPUP --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all">
          <div className="mc-panel p-8 shadow-[4px_4px_0px_0px_#3C4142] flex flex-col items-center text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-[#B8C6A5] border-4 border-[#3C4142] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#3C4142]">
              <CheckCircle size={40} className="text-black" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-wide">Task Accepted!</h2>
            <p className="text-[#3C4142] mb-6 font-extrabold text-sm">Redirecting to active tasks...</p>
            
            {/* Loading Bar */}
            <div className="w-full h-4 bg-white border-4 border-[#3C4142] overflow-hidden relative">
              <div className="h-full bg-[#B8C6A5] animate-[loading_2s_ease-in-out_forwards] w-0"></div>
            </div>
          </div>
        </div>
      )}

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

        {/* Title */}
        <div className="mb-8">
            <h1 className="text-3xl font-black uppercase tracking-widest text-black">
                Available Tasks
            </h1>
            <p className="text-[#3C4142] mt-2 font-extrabold text-xs uppercase tracking-wide">
                Earn credits by helping your peers.
            </p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#3C4142] border-t-transparent rounded-none animate-spin mb-4"></div>
                <p className="text-[#3C4142] text-sm font-black uppercase">Loading Tasks...</p>
            </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-6 pb-20">
            {tasks.map((task) => (
              <div
                key={task.id}
                // Matte Campus Panel
                className="relative mc-panel p-6 shadow-[4px_4px_0px_0px_#3C4142] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    {/* Icon Slot */}
                    <div className="p-3 bg-[#CBD5E1] border-2 border-[#3C4142] shadow-[2px_2px_0px_0px_#3C4142]">
                      <Coffee size={24} className="text-black" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-black uppercase tracking-wide">
                        {task.type}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-[#B8C6A5] border border-[#3C4142] animate-pulse"></div>
                        <p className="text-xs text-[#3C4142] font-extrabold font-mono uppercase tracking-wide">
                            REQ: {task.requesterName}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Credits Tag */}
                  <div className="bg-[#e0beb3] border-2 border-[#3C4142] px-3 py-1 text-black text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_#3C4142]">
                    {task.credits || 0} Cr
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-white border-2 border-[#3C4142] p-4 mb-6 shadow-[2px_2px_0px_0px_#3C4142]">
                   <p className="text-black text-sm leading-relaxed font-extrabold font-mono">
                     "{task.desc}"
                   </p>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 text-sm bg-[#CBD5E1] p-3 border-2 border-[#3C4142] shadow-[2px_2px_0px_#3C4142]">
                    <MapPin size={16} className="text-[#e0beb3]" /> 
                    <span className="text-black font-extrabold uppercase text-xs">From:</span> 
                    <span className="text-black font-black uppercase">{task.source?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-[#CBD5E1] p-3 border-2 border-[#3C4142] shadow-[2px_2px_0px_#3C4142]">
                    <MapPin size={16} className="text-[#B8C6A5]" /> 
                    <span className="text-black font-extrabold uppercase text-xs">To:</span> 
                    <span className="text-black font-black uppercase">{task.dest?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-black font-extrabold text-xs uppercase tracking-wide pl-1">
                    <Clock size={16} /> 
                    <span>Expires in:</span> 
                    <span className="text-[#e0beb3]">
                        {Math.round(((task.createdAt.toMillis() + getDurationMs(task.time)) - Date.now()) / 60000)} mins
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {task.requesterId !== currentUserId ? (
                  <button
                    onClick={() => handleAcceptTask(task)}
                    className="mc-button-green w-full text-black font-black py-3.5 border-4 border-[#3C4142] uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#3C4142] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Accept Task <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className="w-full py-3 border-4 border-[#3C4142] bg-[#CBD5E1] text-center shadow-none cursor-not-allowed">
                    <p className="text-xs text-[#3C4142] font-black uppercase tracking-wide">
                      Cannot accept own task
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center mc-panel p-10 text-center min-h-[400px] shadow-[4px_4px_0px_0px_#3C4142]">
            <div className="bg-[#CBD5E1] p-4 border-2 border-[#3C4142] mb-6 shadow-[2px_2px_0px_0px_#3C4142]">
              <Coffee size={48} className="text-black" />
            </div>
            <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wide">All caught up!</h3>
            <p className="text-[#3C4142] mt-2 max-w-xs mx-auto font-extrabold text-xs">
              There are no pending tasks right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;