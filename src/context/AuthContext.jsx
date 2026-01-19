import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    const res = await signInWithEmailAndPassword(auth, email, password);
  
    if (!res.user.emailVerified) {
      await signOut(auth);
      throw new Error("Please verify your email before logging in.");
    }

    const userRef = doc(db, "users", res.user.uid);
    await setDoc(userRef, { verified: true }, { merge: true });
  
    return res;
  };

  // LOGOUT
  const logout = async () => {
    sessionStorage.removeItem('hasAcceptedRules'); 
    await signOut(auth);
  };

  // AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
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
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);