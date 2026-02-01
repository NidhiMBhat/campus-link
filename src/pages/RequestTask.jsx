import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
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
    credits: 0, 
  });

  const [userCredits, setUserCredits] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (auth.currentUser) {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (snap.exists()) setUserCredits(snap.data().credits || 0);
      }
    };
    fetchBalance();
  }, []);
  
  const getCreditRange = (source, dest, time) => {
    if (!source || !dest) return { min: 5, max: 20 };

    const R = 6371; 
    const dLat = (dest.lat - source.lat) * Math.PI / 180;
    const dLng = (dest.lng - source.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(source.lat * Math.PI / 180) * Math.cos(dest.lat * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceInMeters = R * c * 1000;

    let baseMin = Math.max(5, Math.round(distanceInMeters / 15));
    let baseMax = baseMin + 30;

    if (time === "10 mins") { baseMin += 10; baseMax += 20; }
    else if (time === "20 mins") { baseMin += 7; baseMax += 15; }
    else if (time === "30 mins") { baseMin += 5; baseMax += 10; } 
    else if (time === "45 mins") { baseMin += 2; baseMax += 5; }
    else if (time === "1 Hour") { baseMin = Math.max(5, baseMin - 5); }

    return { min: baseMin, max: baseMax };
  };

  const { min, max } = getCreditRange(formData.source, formData.dest, formData.time);

  useEffect(() => {
    if (formData.credits < min) setFormData(prev => ({ ...prev, credits: min }));
    if (formData.credits > max) setFormData(prev => ({ ...prev, credits: max }));
  }, [min, max]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to post a request.");
      return;
    }
  
    if (!formData.source || !formData.dest) {
      alert("Please select both a source and a destination.");
      return;
    }
  
    setLoading(true);
  
    try {
      const userSnap = await getDoc(doc(db, "users", user.uid));
      const userData = userSnap.data() || {};
      const currentCredits = userData.credits || 0;
  
      if (currentCredits < formData.credits) {
        alert(`Insufficient credits. You have ${currentCredits} Cr, but need ${formData.credits} Cr to post this request.`);
        setLoading(false);
        return;
      }

      const sourceGeo = new GeoPoint(formData.source.lat, formData.source.lng);
      const destGeo = new GeoPoint(formData.dest.lat, formData.dest.lng);
    
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
        credits: formData.credits,
        requesterConfirmed: false,
        helperConfirmed: false,
      });
  
      setViewState("success");
  
    } catch (err) {
      console.error("Firestore Write Error:", err);
      alert(`Failed to post: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="app-canvas min-h-screen p-6 font-mono">
      
      <div className="max-w-2xl mx-auto flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center text-[#3C4142] hover:text-black transition w-fit group"
        >
          <div className="bg-[#CBD5E1] p-1 border-2 border-[#3C4142] group-active:translate-y-1 mr-2 shadow-[2px_2px_0px_0px_#3C4142]">
            <ArrowLeft size={20} />
          </div>
          <span className="uppercase font-black tracking-widest text-xs">Back to Menu</span>
        </button>

        {/* Title */}
        <h1 className="text-3xl font-black uppercase tracking-widest text-black mb-6 text-center md:text-left">
          Request Help
        </h1>

        {/* MAIN PANEL */}
        <div className="mc-panel w-full shadow-[4px_4px_0px_0px_#3C4142] transition-all">
           
           {/* Inner Container */}
           <div className="p-6 md:p-8">

              {viewState === "initial" && (
                <div className="flex flex-col items-center justify-center text-center min-h-[300px]">
                  <p className="text-black font-extrabold max-w-xs mb-8 uppercase tracking-wide text-sm leading-relaxed">
                    Need printouts, food, or items delivered? Post a task for other students.
                  </p>
                  
                  {/* Create Button */}
                  <button
                    onClick={() => setViewState("form")}
                    className="mc-button-green py-4 px-8 font-black uppercase tracking-wider text-black 
                             border-4 border-[#3C4142] shadow-[4px_4px_0px_0px_#3C4142]
                             hover:brightness-105 active:translate-y-1 active:shadow-none transition-all"
                  >
                    Create New Task
                  </button>
                </div>
              )}

              {viewState === "form" && (
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}
                  className="space-y-6"
                >
                  {/* Type Selection */}
                  <div>
                    <label className="block text-xs font-black mb-2 uppercase text-black">Type of Task</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none focus:border-[#B8C6A5] shadow-[inset_2px_2px_0px_#ddd]"
                    >
                      <option>Getting Printouts</option>
                      <option>Food Delivery</option>
                      <option>Pick up from Gate</option>
                      <option>Item handover</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-black mb-2 uppercase text-black">Description</label>
                    <textarea
                      name="desc"
                      rows="3"
                      placeholder="Brief description..."
                      value={formData.desc}
                      onChange={handleInputChange}
                      className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none focus:border-[#B8C6A5] shadow-[inset_2px_2px_0px_#ddd]"
                      required
                    />
                  </div>

                  {/* Location Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-black mb-2 uppercase text-black">Source</label>
                        <select
                            onChange={(e) =>
                            setFormData({
                                ...formData,
                                source: CAMPUS_LOCATIONS.find(l => l.name === e.target.value)
                            })
                            }
                            required
                            className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none focus:border-[#B8C6A5] shadow-[inset_2px_2px_0px_#ddd]"
                        >
                            <option value="">Select Location</option>
                            {CAMPUS_LOCATIONS.map(loc => (
                            <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black mb-2 uppercase text-black">Destination</label>
                        <select
                            onChange={(e) =>
                            setFormData({
                                ...formData,
                                dest: CAMPUS_LOCATIONS.find(l => l.name === e.target.value)
                            })
                            }
                            required
                            className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none focus:border-[#B8C6A5] shadow-[inset_2px_2px_0px_#ddd]"
                        >
                            <option value="">Select Location</option>
                            {CAMPUS_LOCATIONS.map(loc => (
                            <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>
                  </div>

                  {/* Urgency */}
                  <div>
                    <label className="block text-xs font-black mb-2 uppercase text-black">Urgency</label>
                    <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full bg-white border-4 border-[#3C4142] p-3 text-black font-mono outline-none focus:border-[#B8C6A5] shadow-[inset_2px_2px_0px_#ddd]"
                    >
                        <option>10 mins</option>
                        <option>20 mins</option>
                        <option>30 mins</option>
                        <option>45 mins</option>
                        <option>1 Hour</option>
                    </select>
                  </div>

                  {/* Credits Section */}
                  <div className="bg-[#CBD5E1] p-4 border-4 border-[#3C4142] shadow-[2px_2px_0px_0px_#3C4142]">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-black font-black text-xs uppercase">Reward Offered</label>
                      <span className="text-xl font-black text-black">{formData.credits} Cr</span>
                    </div>
                    
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step="1"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="w-full h-2 bg-white rounded-none appearance-none cursor-pointer border-2 border-[#3C4142] accent-[#B8C6A5]"
                    />
                    
                    <div className="flex justify-between text-[10px] text-black mt-2 font-black uppercase tracking-widest">
                      <span>Min: {min}</span>
                      <span>Max: {max}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || formData.credits > userCredits}
                    onClick={handleSubmit}
                    className={`w-full py-4 px-6 font-black uppercase tracking-wider text-black border-4 border-[#3C4142] transition-all
                      ${formData.credits > userCredits 
                        ? "bg-[#CBD5E1] cursor-not-allowed shadow-none text-[#3C4142]" 
                        : "mc-button-green shadow-[4px_4px_0px_0px_#3C4142] hover:brightness-105 active:translate-y-1 active:shadow-none"
                      }`}
                  >
                    {loading ? "Processing..." : formData.credits > userCredits ? "Insufficient Credits" : "Post Task"}
                  </button>
                </form>
              )}

              {viewState === "success" && (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <CheckCircle size={64} className="text-[#B8C6A5] mb-4" />
                  <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-wide">
                    Task Posted!
                  </h2>
                  <p className="text-[#3C4142] mb-8 font-extrabold text-sm">
                    Credits will be deducted upon completion.
                  </p>
                  <button
                    onClick={() => navigate("/my-requests")}
                    className="mc-button-blue py-3 px-6 font-black uppercase tracking-wider text-black 
                             border-4 border-[#3C4142] shadow-[4px_4px_0px_0px_#3C4142]
                             hover:brightness-105 active:translate-y-1 active:shadow-none transition-all"
                  >
                    View My Tasks
                  </button>
                </div>
              )}

           </div>
        </div>

      </div>
    </div>
  );
};

export default RequestTask;