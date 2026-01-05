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
  
    // Save form data to Firestore immediately (unverified)
    await setDoc(doc(db, "users", res.user.uid), {
      uid: res.user.uid,
      email,
      fullName,
      phone,
      verified: false,
      createdAt: new Date(),
      credits : 0,
      requested: 0,
      helped: 0,
      lastKnownLocation: {
        lat: 12.96,
        lng: 77.60,
        updatedAt: timestamp
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
      alert("Please verify your email before logging in.");
      return null;
    }

  
    // Update verified flag only
    const userRef = doc(db, "users", res.user.uid);
    await setDoc(userRef, { verified: true }, { merge: true });
  
    return res;
  };
  

  // LOGOUT
  const logout = () => signOut(auth);

  // AUTH STATE LISTENER
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        setUser({ uid: firebaseUser.uid, ...snap.data(), verified: true });
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
