// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getAuth} from 'firebase/auth'
import {getFirestore} from 'firebase/firestore'
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAubZHtXthNct0N9q0OGYas931Fh3TUWDE",
  authDomain: "campus-link-fad29.firebaseapp.com",
  projectId: "campus-link-fad29",
  storageBucket: "campus-link-fad29.firebasestorage.app",
  messagingSenderId: "465697861056",
  appId: "1:465697861056:web:ccc11b4012500d71222c25",
  measurementId: "G-W8DPBDKKJV"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);