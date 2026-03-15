/**
 * firebase/firebase.js
 *
 * Firebase client-side SDK initialisation.
 *
 * ✅  Config values read from .env (REACT_APP_ prefix required by CRA)
 *     so the API key is never hardcoded in source.
 *
 * Add these to your frontend .env file:
 *   REACT_APP_FIREBASE_API_KEY=AIzaSy...
 *   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
 *   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
 *   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=275485904635
 *   REACT_APP_FIREBASE_APP_ID=1:275485904635:web:...
 */

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
