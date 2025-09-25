import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAJx6UN3mCDiKQ7hg1Ncfu-nVBozzzizBw",
  authDomain: "vyss-50933.firebaseapp.com",
  projectId: "vyss-50933",
  storageBucket: "vyss-50933.firebasestorage.app",
  messagingSenderId: "570325532282",
  appId: "1:570325532282:web:4482027f7d42492adbc5c3"
};


const app = initializeApp(firebaseConfig);
console.log("Firebase Initialized.........................");
export const db = getFirestore(app);