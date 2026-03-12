// ============================================================
// Firebase Client SDK 初期化 (ブラウザ側 — リアルタイム監視用)
// ============================================================

import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtSCqmQT5OmpmpWg0GmbOVsE6Ly1E4S60",
  authDomain: "trackandprograming.firebaseapp.com",
  projectId: "trackandprograming",
  storageBucket: "trackandprograming.firebasestorage.app",
  messagingSenderId: "113036293972",
  appId: "1:113036293972:web:4d5a272ccc6eaf80593ac1",
  measurementId: "G-HKY3R1W5JT",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const clientDb = getFirestore(app);
