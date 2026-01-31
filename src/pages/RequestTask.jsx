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
    
    <div className="min-h-screen p-6 font-mono bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
      
      <div className="max-w-2xl mx-auto flex flex-col">
        {/* Back Button */}
        <button
          onClick={() => navigate("/home")}
          className="mb-6 flex items-center text-white hover:text-yellow-400 transition w-fit group"
        >
          <div className="bg-[#555] p-1 border-2 border-black group-active:translate-y-1 mr-2">
            <ArrowLeft size={20} />
          </div>
          <span className="uppercase font-bold tracking-widest text-xs shadow-black drop-shadow-md">Back to Menu</span>
        </button>

        {/* Title */}
        <h1 className="text-3xl font-bold uppercase tracking-widest text-[#FCD34D] [text-shadow:3px_3px_#000] mb-6 text-center md:text-left">
          Request Help
        </h1>

        {/* MAIN PANEL */}
        {/* Using the floating effect and stone texture logic */}
        <div className="bg-[#c6c6c6] w-full border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] transition-all">
           
           {/* Inner Bevel */}
           <div className="border-t-4 border-l-4 border-white border-b-4 border-r-4 border-[#555] p-6 md:p-8">

              {viewState === "initial" && (
                <div className="flex flex-col items-center justify-center text-center min-h-[300px]">
                  <p className="text-[#333] font-bold max-w-xs mb-8 uppercase tracking-wide text-sm leading-relaxed">
                    Need printouts, food, or items delivered? Post a quest for other players.
                  </p>
                  
                  {/* Create Button */}
                  <button
                    onClick={() => setViewState("form")}
                    className="py-4 px-8 font-bold uppercase tracking-wider text-white 
                             bg-[#3c8527] border-4 border-black 
                             shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513]
                             hover:bg-[#4ca633] active:translate-y-1 active:shadow-none transition-all
                             text-shadow-[2px_2px_#000]"
                  >
                    Create New Quest
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
                    <label className="block text-xs font-bold mb-2 uppercase text-[#333]">Type of Quest</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-[#eee] border-2 border-[#555] p-3 text-black font-mono outline-none focus:border-[#A855F7] focus:bg-white shadow-[inset_2px_2px_0px_#aaa]"
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
                    <label className="block text-xs font-bold mb-2 uppercase text-[#333]">Description</label>
                    <textarea
                      name="desc"
                      rows="3"
                      placeholder="Brief description..."
                      value={formData.desc}
                      onChange={handleInputChange}
                      className="w-full bg-[#eee] border-2 border-[#555] p-3 text-black font-mono outline-none focus:border-[#A855F7] focus:bg-white shadow-[inset_2px_2px_0px_#aaa]"
                      required
                    />
                  </div>

                  {/* Location Selectors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold mb-2 uppercase text-[#333]">Source</label>
                        <select
                            onChange={(e) =>
                            setFormData({
                                ...formData,
                                source: CAMPUS_LOCATIONS.find(l => l.name === e.target.value)
                            })
                            }
                            required
                            className="w-full bg-[#eee] border-2 border-[#555] p-3 text-black font-mono outline-none focus:border-[#A855F7] focus:bg-white shadow-[inset_2px_2px_0px_#aaa]"
                        >
                            <option value="">Select Location</option>
                            {CAMPUS_LOCATIONS.map(loc => (
                            <option key={loc.name} value={loc.name}>{loc.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold mb-2 uppercase text-[#333]">Destination</label>
                        <select
                            onChange={(e) =>
                            setFormData({
                                ...formData,
                                dest: CAMPUS_LOCATIONS.find(l => l.name === e.target.value)
                            })
                            }
                            required
                            className="w-full bg-[#eee] border-2 border-[#555] p-3 text-black font-mono outline-none focus:border-[#A855F7] focus:bg-white shadow-[inset_2px_2px_0px_#aaa]"
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
                    <label className="block text-xs font-bold mb-2 uppercase text-[#333]">Urgency</label>
                    <select
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        className="w-full bg-[#eee] border-2 border-[#555] p-3 text-black font-mono outline-none focus:border-[#A855F7] focus:bg-white shadow-[inset_2px_2px_0px_#aaa]"
                    >
                        <option>10 mins</option>
                        <option>20 mins</option>
                        <option>30 mins</option>
                        <option>45 mins</option>
                        <option>1 Hour</option>
                    </select>
                  </div>

                  {/* Credits Machine */}
                  <div className="bg-[#8B8B8B] p-4 border-4 border-black shadow-[inset_4px_4px_0px_#373737,inset_-2px_-2px_0px_#FFF]">
                    <div className="flex justify-between items-center mb-4">
                      <label className="text-white font-bold text-xs uppercase shadow-black drop-shadow-md">Reward Offered</label>
                      <span className="text-xl font-bold text-[#FCD34D] [text-shadow:2px_2px_#000]">{formData.credits} Cr</span>
                    </div>
                    
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step="1"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="w-full h-2 bg-black rounded-none appearance-none cursor-pointer border-2 border-[#555] accent-[#3c8527]"
                    />
                    
                    <div className="flex justify-between text-[10px] text-white mt-2 font-bold uppercase tracking-widest">
                      <span>Min: {min}</span>
                      <span>Max: {max}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || formData.credits > userCredits}
                    onClick={handleSubmit}
                    className={`w-full py-4 px-6 font-bold uppercase tracking-wider text-white border-4 border-black text-shadow-[2px_2px_#000] transition-all
                      ${formData.credits > userCredits 
                        ? "bg-[#555] cursor-not-allowed shadow-none text-gray-400" 
                        : "bg-[#3c8527] shadow-[inset_4px_4px_0px_0px_#5cbd38,inset_-4px_-4px_0px_0px_#1e4513] hover:bg-[#4ca633] active:translate-y-1"
                      }`}
                  >
                    {loading ? "Processing..." : formData.credits > userCredits ? "Insufficient Credits" : "Post Quest"}
                  </button>
                </form>
              )}

              {viewState === "success" && (
                <div className="flex flex-col items-center justify-center text-center py-10">
                  <CheckCircle size={64} className="text-[#3c8527] mb-4 drop-shadow-md" />
                  <h2 className="text-2xl font-bold text-[#333] mb-2 uppercase tracking-wide">
                    Quest Posted!
                  </h2>
                  <p className="text-[#555] mb-8 font-bold text-sm">
                    Credits will be deducted upon completion.
                  </p>
                  <button
                    onClick={() => navigate("/my-requests")}
                    className="py-3 px-6 font-bold uppercase tracking-wider text-white 
                             bg-[#5D737E] border-4 border-black 
                             shadow-[inset_4px_4px_0px_0px_#A2B9C4,inset_-4px_-4px_0px_0px_#333]
                             hover:bg-[#6D838E] active:translate-y-1 transition-all"
                  >
                    View My Quests
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