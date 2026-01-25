import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyA0PTGXXRwq_OZ8mnIpK-yLg5I9ArRYMGk",
  authDomain: "realtime-ab23b.firebaseapp.com",
  projectId: "realtime-ab23b",
  storageBucket: "realtime-ab23b.firebasestorage.app",
  messagingSenderId: "801943843025",
  appId: "1:801943843025:web:246dbf84099861ebf215f0",
  measurementId: "G-X5R31Z4BKV"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);
 
 
 
// Initialize Firestore
export const db = getFirestore(app);
 
export default app;