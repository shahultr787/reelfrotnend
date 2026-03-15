/**
 * services/authService.js
 */

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth, googleProvider } from "../firebase/firebase";
import { getFingerprint, getBotSignals } from "./fingerprint";

const API_BASE = process.env.REACT_APP_API_BASE;

/* ─── Persistent Device ID ───────────────────────────── */

const getDeviceId = () => {
  let id = localStorage.getItem("deviceId");

  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("deviceId", id);
  }

  return id;
};

/* ─── Send Firebase token to backend ─────────────────── */

export const sendTokenToBackend = async (idToken) => {

  const body = {
    idToken,
    deviceId: getDeviceId(),
    fingerprint: getFingerprint(),
    botSignals: getBotSignals()   // ✅ new security signals
  };

  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Login failed. Please try again.");
  }

  return res.json();
};

/* ─── Fetch authenticated user ───────────────────────── */

export const fetchAuthenticatedUser = async () => {

  try {

    const res = await fetch(`${API_BASE}/api/profile`, {
      credentials: "include"
    });

    if (!res.ok) return null;

    return res.json();

  } catch {
    return null;
  }

};

/* ─── Google Login ───────────────────────────────────── */

export const loginWithGoogle = async () => {

  const result = await signInWithPopup(auth, googleProvider);

  const idToken = await result.user.getIdToken();

  return sendTokenToBackend(idToken);

};

/* ─── Email Login ───────────────────────────────────── */

export const loginWithEmail = async (email, password) => {

  const result = await signInWithEmailAndPassword(auth, email, password);

  const idToken = await result.user.getIdToken();

  return sendTokenToBackend(idToken);

};

/* ─── Email Register ────────────────────────────────── */

export const registerWithEmail = async (name, email, password) => {

  const result = await createUserWithEmailAndPassword(auth, email, password);

  const idToken = await result.user.getIdToken();

  return sendTokenToBackend(idToken);

};