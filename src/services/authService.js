import {
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase/firebase";

const API_BASE = process.env.REACT_APP_API_BASE;

/* ===========================
   🧠 DEVICE ID HANDLER
=========================== */

const getDeviceId = () => {
  let deviceId = localStorage.getItem("deviceId");

  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("deviceId", deviceId);
  }

  return deviceId;
};

/* ===========================
   🔥 Send Firebase ID token to backend
=========================== */

export const sendTokenToBackend = async (idToken) => {
  const deviceId = getDeviceId();   // 🔥 NEW

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      idToken,
      deviceId,  // 🔥 NEW (important)
    }),
  });

  if (!res.ok) throw new Error("Backend login failed");

  return res.json();
};

/* ===========================
   🔥 Fetch authenticated user
=========================== */

export const fetchAuthenticatedUser = async () => {
  const res = await fetch(`${API_BASE}/api/protected`, {
    credentials: "include",
  });

  if (!res.ok) return null;

  return res.json();
};

/* ===========================
   🔐 Google Login
=========================== */

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const idToken = await result.user.getIdToken();

  return sendTokenToBackend(idToken);
};

/* ===========================
   🔐 Email Login
=========================== */

export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await result.user.getIdToken();

  return sendTokenToBackend(idToken);
};