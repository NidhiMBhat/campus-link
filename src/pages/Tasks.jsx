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
    // MAIN CONTAINER: Dark Cubes Background
    <div className="min-h-screen w-full font-mono bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      {/* --- SUCCESS MODAL POPUP (Minecraft Style) --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all">
          <div className="bg-[#C6C6C6] border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] flex flex-col items-center text-center max-w-sm w-full">
            <div className="w-20 h-20 bg-[#3c8527] border-4 border-black flex items-center justify-center mb-6 shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513]">
              <CheckCircle size={40} className="text-white drop-shadow-md" />
            </div>
            <h2 className="text-2xl font-bold text-[#333] mb-2 uppercase tracking-wide">Quest Accepted!</h2>
            <p className="text-[#555] mb-6 font-bold text-sm">Redirecting to active quests...</p>
            
            {/* Loading Bar (Green) */}
            <div className="w-full h-4 bg-[#333] border-2 border-black overflow-hidden relative">
              <div className="h-full bg-[#3c8527] animate-[loading_2s_ease-in-out_forwards] w-0"></div>
            </div>
          </div>
        </div>
      )}

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

        {/* Title */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:3px_3px_#000]">
                Available Quests
            </h1>
            <p className="text-gray-400 mt-2 font-bold text-xs uppercase tracking-wide bg-black/50 inline-block px-2">
                Earn credits by helping your peers.
            </p>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-none animate-spin mb-4"></div>
                <p className="text-gray-400 text-sm font-bold uppercase">Scanning Area...</p>
            </div>
        ) : tasks.length > 0 ? (
          <div className="space-y-6 pb-20">
            {tasks.map((task) => (
              <div
                key={task.id}
                // MINECRAFT PANEL: Stone background
                className="relative bg-[#C6C6C6] border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    {/* Icon Slot */}
                    <div className="p-3 bg-[#8B8B8B] border-2 border-black shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
                      <Coffee size={24} className="text-white drop-shadow-md" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#333] uppercase tracking-wide">
                        {task.type}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 bg-[#3c8527] border border-black animate-pulse"></div>
                        <p className="text-xs text-[#555] font-bold font-mono uppercase tracking-wide">
                            REQ: {task.requesterName}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Credits Tag */}
                  <div className="bg-[#8B8B8B] border-2 border-black px-3 py-1 text-[#FCD34D] text-xs font-bold tracking-wider uppercase shadow-[inset_2px_2px_0px_#373737] text-shadow-sm">
                    {task.credits || 0} Cr
                  </div>
                </div>

                {/* Description Box */}
                <div className="bg-[#8B8B8B] border-2 border-black p-4 mb-6 shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
                   <p className="text-white text-sm leading-relaxed font-bold font-mono">
                     "{task.desc}"
                   </p>
                </div>

                {/* Details Section */}
                <div className="flex flex-col gap-3 mb-6">
                  <div className="flex items-center gap-3 text-sm bg-[#A2B9C4] p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
                    <MapPin size={16} className="text-[#A32222]" /> 
                    <span className="text-[#333] font-bold uppercase text-xs">From:</span> 
                    <span className="text-black font-bold uppercase">{task.source?.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm bg-[#A2B9C4] p-3 border-2 border-black shadow-[2px_2px_0px_#000]">
                    <MapPin size={16} className="text-[#3c8527]" /> 
                    <span className="text-[#333] font-bold uppercase text-xs">To:</span> 
                    <span className="text-black font-bold uppercase">{task.dest?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#333] font-bold text-xs uppercase tracking-wide pl-1">
                    <Clock size={16} /> 
                    <span>Expires in:</span> 
                    <span className="text-[#A32222]">
                        {Math.round(((task.createdAt.toMillis() + getDurationMs(task.time)) - Date.now()) / 60000)} mins
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                {task.requesterId !== currentUserId ? (
                  <button
                    onClick={() => handleAcceptTask(task)}
                    className="w-full bg-[#3c8527] hover:bg-[#4ca633] text-white font-bold py-3.5 border-4 border-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513] active:translate-y-1 active:shadow-none transition-all"
                  >
                    Accept Quest <ArrowRight size={20} />
                  </button>
                ) : (
                  <div className="w-full py-3 border-4 border-black bg-[#555] text-center shadow-none cursor-not-allowed">
                    <p className="text-xs text-[#aaa] font-bold uppercase tracking-wide">
                      Cannot accept own quest
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center bg-[#C6C6C6] border-4 border-black p-10 text-center min-h-[400px] shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]">
            <div className="bg-[#8B8B8B] p-4 border-2 border-black mb-6 shadow-[inset_3px_3px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
              <Coffee size={48} className="text-[#333]" />
            </div>
            <h3 className="text-lg font-bold text-[#333] mb-2 uppercase tracking-wide">All caught up!</h3>
            <p className="text-[#555] mt-2 max-w-xs mx-auto font-bold text-xs">
              There are no pending quests in this server right now.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;