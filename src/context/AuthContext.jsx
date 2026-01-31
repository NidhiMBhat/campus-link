import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,         // <--- ADDED
  browserLocalPersistence // <--- ADDED
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // REGISTER
  const register = async (email, password, fullName, phone) => {
    const collegeRegex = /^[a-zA-Z0-9._%+-]+@rvce\.edu\.in$/;
    if (!collegeRegex.test(email)) {
      throw new Error("Please use a valid @rvce.edu.in email");
    }
  
    const res = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(res.user);
  
    const now = new Date().toISOString(); 

    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email,
      fullName,
      phone,
      verified: false,
      createdAt: now,
      credits: 50,
      requested: 0,
      helped: 0,
      isBlacklisted: false, // Default status
      lastKnownLocation: {
        lat: 12.96,
        lng: 77.60,
        updatedAt: now
      },
      locationPermission: "granted",
    });
  
    return res.user;
  };

  // LOGIN
  const login = async (email, password) => {
    // 1. Enable Persistence (Stay logged in even if tab closes)
    await setPersistence(auth, browserLocalPersistence);

    const res = await signInWithEmailAndPassword(auth, email, password);
  
    if (!res.user.emailVerified) {
      await signOut(auth);
      throw new Error("Please verify your email before logging in.");
    }

    // 2. Save Login Timestamp (For 24h Timer)
    localStorage.setItem("loginTimestamp", Date.now().toString());

    const userRef = doc(db, "users", res.user.uid);
    await setDoc(userRef, { verified: true }, { merge: true });
  
    return res;
  };

  // LOGOUT
  const logout = async () => {
    sessionStorage.removeItem('hasAcceptedRules'); 
    localStorage.removeItem("loginTimestamp"); // <--- Clear the timer
    await signOut(auth);
  };

  // AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        
        // --- 24-HOUR SESSION CHECK ---
        const savedTime = localStorage.getItem("loginTimestamp");
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        
        // If time exists AND it has been more than 24 hours
        if (savedTime && (Date.now() - parseInt(savedTime) > ONE_DAY_MS)) {
             console.log("Session expired. Logging out.");
             await signOut(auth);
             setUser(null);
             setLoading(false);
             return;
        }
        // -----------------------------

        // We fetch the doc even if email not verified to check blacklist status
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        
        if (snap.exists()) {
             const data = snap.data();

             // --- BLACKLIST CHECK START ---
             if (data.isBlacklisted) {
                 alert("⚠️ ACCOUNT SUSPENDED ⚠️\n\nYour account has been blacklisted due to reported violations.\nYou cannot access CampusLink.");
                 await signOut(auth); // Kick them out immediately
                 setUser(null);
                 setLoading(false);
                 return;
             }
             // --- BLACKLIST CHECK END ---

             // Proceed only if email is verified (or if it's the specific admin bypassing)
             if(firebaseUser.emailVerified || data.email === "admin@campuslink.com") {
                setUser({ uid: firebaseUser.uid, ...data, verified: true });
                
                // Safety: If user is logged in but has no timestamp (old session), start the timer now
                if (!savedTime) {
                    localStorage.setItem("loginTimestamp", Date.now().toString());
                }

             } else {
                 setUser(null);
             }
        } else {
             // Fallback for users without docs (rare)
             setUser({ uid: firebaseUser.uid, email: firebaseUser.email, verified: firebaseUser.emailVerified });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, register, login, logout, forgotPassword }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);