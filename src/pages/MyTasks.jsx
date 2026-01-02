import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FolderOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const MyTasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!user) return;

      const q = query(
        collection(db, "tasks"),
        where("helperId", "==", user.uid)
      );

      const snap = await getDocs(q);
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    };

    fetchTasks();
  }, [user]);

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto">
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
          <div
            key={task.id}
            className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-xl mb-4"
          >
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
            <p className="text-gray-400 text-sm mt-1">{task.description}</p>
            <p className="mt-2 text-gray-300">
              Credits: <span className="font-bold">{task.credits}</span>
            </p>
            <p className="text-gray-400 text-sm">Status: {task.status}</p>
          </div>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center bg-gray-800/30 rounded-2xl p-8 text-center min-h-[400px]">
          <FolderOpen size={48} className="text-gray-600 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No tasks yet</h3>
          <p className="text-gray-500">You haven’t accepted any tasks.</p>
        </div>
      )}
    </div>
  );
};

export default MyTasks;
