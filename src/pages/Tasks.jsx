import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Coffee, MapPin, Clock, ArrowRight } from "lucide-react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

const Tasks = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentUserId = auth.currentUser?.uid;


  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const q = query(
          collection(db, "requests"),
          where("status", "==", "pending")
        );

        const snap = await getDocs(q);
        const fetchedTasks = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

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
      try {
    // 1. Check if the helper already has an active task in 'Accepted' status
        const activeTaskQuery = query(
          collection(db, "requests"),
          where("helperId", "==", user.uid),
          where("status", "==", "accepted")
    );
        const activeTaskSnap = await getDocs(activeTaskQuery);
        if (!activeTaskSnap.empty) {
          alert("You can only accept one task at a time. Please complete your current task first.");
          return;
        }
      await updateDoc(doc(db, "requests", task.id), {
        status: "accepted",
        helperId: user.uid,
        requesterConfirmed: false, // Initialize for dual-confirmation
        helperConfirmed: false,
      });

      // Remove accepted task from list instantly
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      navigate("/my-tasks");
    } catch (err) {
      console.error(err);
      alert("Failed to accept task");
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

      <h1 className="text-2xl font-bold text-white mb-6">Available Tasks</h1>

      {loading ? (
        <p className="text-gray-400 text-center">Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <div className="space-y-4 animate-fade-in">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-indigo-500 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/20 rounded-full text-indigo-400">
                    <Coffee size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {task.type}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Req by: {task.requesterName}
                    </p>
                  </div>
                </div>

               
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">
                    {task.credits || 0} Cr
                </span>
              </div>

              <p className="text-gray-300 mb-4 bg-gray-900/50 p-3 rounded-lg text-sm">
                {task.desc}
              </p>

              <div className="flex flex-col gap-2 text-sm text-gray-400 mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> <span className="text-gray-500">From:</span>{" "}
                  {task.source?.name}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> <span className="text-gray-500">To:</span>{" "}
                  {task.dest?.name}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />{" "}
                  <span className="text-gray-500">Within:</span> {task.time}
                </div>
              </div>

              {task.requesterId !== currentUserId ? (
              <button
                onClick={() => handleAcceptTask(task)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
              >
                Accept Task <ArrowRight size={20} />
              </button>
            ) : (
              <p className="text-center text-sm text-gray-500 italic">
                You can’t accept your own request
              </p>
            )}

            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/30 rounded-2xl p-8 text-center min-h-[400px]">
          <Coffee size={48} className="text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-white">All caught up!</h3>
          <p className="text-gray-500 mt-2 max-w-xs">
            There are no pending tasks right now.
          </p>
        </div>
      )}
    </div>
  );
};

export default Tasks;
