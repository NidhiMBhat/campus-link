import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithRedirect,
  browserPopupRedirectResolver,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const forgotPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // --- GOOGLE SIGN IN (REDIRECT VERSION) ---
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ 
      hd: "rvce.edu.in", 
      prompt: "select_account" 
    });

    try {
      // Use the resolver to clear potential stale domain errors
      await signInWithRedirect(auth, provider, browserPopupRedirectResolver);
    } catch (error) {
      console.error("Auth Error:", error.message);
    }
  };

  // --- REGISTER (EMAIL/PASS) ---
  const register = async (email, password, fullName, phone) => {
    const collegeRegex = /^[a-zA-Z0-9._%+-]+@rvce\.edu\.in$/;
    if (!collegeRegex.test(email)) {
      throw new Error("Please use a valid @rvce.edu.in email");
    }

    const res = await createUserWithEmailAndPassword(auth, email, password);
    const now = new Date().toISOString();

    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email,
      fullName,
      phone,
      verified: true,
      createdAt: now,
      credits: 50,
      requested: 0,
      helped: 0,
      isBlacklisted: false,
      lastKnownLocation: { lat: 12.96, lng: 77.60, updatedAt: now },
      locationPermission: "granted",
    });

    return res.user;
  };

  // --- LOGIN (EMAIL/PASS) ---
  const login = async (email, password) => {
    await setPersistence(auth, browserLocalPersistence);
    const res = await signInWithEmailAndPassword(auth, email, password);

    localStorage.setItem("loginTimestamp", Date.now().toString());
    const userRef = doc(db, "users", res.user.uid);
    await setDoc(userRef, { verified: true }, { merge: true });

    return res;
  };

  // --- LOGOUT ---
  const logout = async () => {
    sessionStorage.removeItem("hasAcceptedRules");
    localStorage.removeItem("loginTimestamp");
    await signOut(auth);
  };

  // --- AUTH STATE LISTENER (THE CORE LOGIC) ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true); // Ensure we are in a loading state while processing

      if (firebaseUser) {
        // 1. Domain Check (Case-Insensitive)
        if (!firebaseUser.email.toLowerCase().endsWith("@rvce.edu.in")) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        // 2. 24-Hour Session Check
        const savedTime = localStorage.getItem("loginTimestamp");
        const ONE_DAY_MS = 24 * 60 * 60 * 1000;
        if (savedTime && Date.now() - parseInt(savedTime) > ONE_DAY_MS) {
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        // 3. Firestore Sync (Fetch or Create)
        const userRef = doc(db, "users", firebaseUser.uid);
        let snap = await getDoc(userRef);

        if (!snap.exists()) {
          const now = new Date().toISOString();
          const newUserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || "RVCE Student",
            phone: "",
            verified: true,
            createdAt: now,
            credits: 50,
            requested: 0,
            helped: 0,
            isBlacklisted: false,
            lastKnownLocation: { lat: 12.96, lng: 77.60, updatedAt: now },
            locationPermission: "granted",
          };
          await setDoc(userRef, newUserData);
          snap = await getDoc(userRef); // Re-fetch to confirm data
        }

        const data = snap.data();

        // 4. Blacklist Check
        if (data.isBlacklisted) {
          alert("⚠️ ACCOUNT SUSPENDED ⚠️");
          await signOut(auth);
          setUser(null);
          setLoading(false);
          return;
        }

        // 5. Finalize User State
        setUser({ uid: firebaseUser.uid, ...data, verified: true });
        if (!savedTime) {
          localStorage.setItem("loginTimestamp", Date.now().toString());
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, register, login, logout, forgotPassword, signInWithGoogle }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);