import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import { auth, db } from "../firebase";
import { CAMPUS_LOCATIONS } from "../data/locations";
import { doc, getDoc, addDoc, collection, serverTimestamp, GeoPoint } from "firebase/firestore";

const RequestTask = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState("initial");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    type: "Getting Printouts",
    desc: "",
    source: null,
    dest: null,
    time: "30 mins",
  });
  

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Check if user is actually logged in
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to post a request.");
      return;
    }
  
    // 2. Validate that locations are selected
    if (!formData.source || !formData.dest) {
      alert("Please select both a source and a destination.");
      return;
    }
  
    setLoading(true);
  
    try {
      // Fetch user profile
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data() || {};
  
      // Create GeoPoints
      const sourceGeo = new GeoPoint(formData.source.lat, formData.source.lng);
      const destGeo = new GeoPoint(formData.dest.lat, formData.dest.lng);
    
      // 3. Perform the write
      await addDoc(collection(db, "requests"), {
        type: formData.type,
        desc: formData.desc,
        source: { name: formData.source.name, location: sourceGeo },
        dest: { name: formData.dest.name, location: destGeo },
        time: formData.time,
        status: "pending",
        requesterId: user.uid,
        requesterName: userData.fullName || "Anonymous",
        requesterEmail: user.email,
        requesterPhone: userData.phone || "",
        helperId: null,
        createdAt: serverTimestamp(),
      });
  
      // ONLY set success if the write completes successfully
      setViewState("success");
  
    } catch (err) {
      console.error("Firestore Write Error:", err);
      alert(`Failed to post: ${err.message}`);
    } finally {
      setLoading(false);
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

      <h1 className="text-2xl font-bold text-white mb-6">Request Help</h1>

      {viewState === "initial" && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800/50 border-2 border-dashed border-gray-700 rounded-2xl p-10 text-center min-h-[400px]">
        
          <p className="text-gray-400 max-w-xs mb-6">
            Need printouts, food, or other stuff delivered? Create your request now.
          </p>
          <button
            onClick={() => setViewState("form")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition"
          >
            Create New Request
          </button>
        </div>
      )}

      {viewState === "form" && (
        <form
          onSubmit={(e) => { e.preventDefault(); 
          console.log("Form submitted!"); handleSubmit(e); }}
          className="bg-gray-800 p-6 rounded-2xl border border-gray-700 space-y-5"
        >
          <div>
            <label className="block text-gray-400 text-sm mb-2">Type of Work</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl"
            >
              <option>Getting Printouts</option>
              <option>Food Delivery (Canteen)</option>
              <option>Pick up from Gate</option>
              <option>Other</option>
            </select>
          </div>

          <textarea
            name="desc"
            rows="3"
            placeholder="Brief description"
            value={formData.desc}
            onChange={handleInputChange}
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
          onChange={(e) =>
          setFormData({
            ...formData,
            source: CAMPUS_LOCATIONS.find(l => l.name === e.target.value)
          })
        }
        required
        className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl"
      >
        <option value="">Select source</option>
        {CAMPUS_LOCATIONS.map(loc => (
          <option key={loc.name} value={loc.name}>{loc.name}</option>
        ))}
      </select>

      <select
        onChange={(e) =>
          setFormData({
            ...formData,
            dest: CAMPUS_LOCATIONS.find(l => l.name === e.target.value)
          })
        }
        required
        className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl"
      >
        <option value="">Select destination</option>
        {CAMPUS_LOCATIONS.map(loc => (
          <option key={loc.name} value={loc.name}>{loc.name}</option>
        ))}
      </select>

          </div>

          <select
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="w-full bg-gray-900 border border-gray-700 text-white p-3 rounded-xl"
          >
            <option>10 mins</option>
            <option>20 mins</option>
            <option>30 mins</option>
            <option>45 mins</option>
            <option>1 Hour</option>
          </select>

          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl"
          >
            {loading ? "Posting..." : "Submit Request"}
          </button>
        </form>
      )}

      {viewState === "success" && (
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-8 rounded-2xl border border-gray-700 text-center">
          <CheckCircle size={64} className="text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Request Posted!
          </h2>
          <p className="text-gray-400 mb-8">
            Credits will be deducted once the task is completed.
          </p>
          <button
            onClick={() => navigate("/my-requests")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl w-full"
          >
            View My Requests
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestTask;
