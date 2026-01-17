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
  
    // FIX: Define a consistent time string to avoid "timestamp is not defined" error
    const now = new Date().toISOString(); 

    // Save form data to Firestore immediately (unverified)
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email,
      fullName,
      phone,
      verified: false,
      createdAt: now, // FIX: Use string instead of raw Date object for safety
      credits: 50,
      requested: 0,
      helped: 0,
      lastKnownLocation: {
        lat: 12.96,
        lng: 77.60,
        updatedAt: now // FIX: Replaced undefined 'timestamp' with 'now'
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
      // Changed alert to throw Error so your UI can catch and display it properly
      throw new Error("Please verify your email before logging in.");
    }

    // Update verified flag only
    const userRef = doc(db, "users", res.user.uid);
    await setDoc(userRef, { verified: true }, { merge: true });
  
    return res;
  };
  

  // LOGOUT
  const logout = async () => {
    // FIX: Clear the "Rulebook Accepted" flag so it shows again for the next login
    sessionStorage.removeItem('hasAcceptedRules'); 
    await signOut(auth);
  };

  // AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        
        // Safety check in case firestore doc doesn't exist yet
        if (snap.exists()) {
             setUser({ uid: firebaseUser.uid, ...snap.data(), verified: true });
        } else {
             setUser({ uid: firebaseUser.uid, email: firebaseUser.email, verified: true });
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