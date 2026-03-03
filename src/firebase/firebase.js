import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC7YBwoD-9wndXDTzJGOjrvqaIWLpQ63SQ",
  authDomain: "instagrammatr-84473.firebaseapp.com",
  projectId: "instagrammatr-84473",
  storageBucket: "instagrammatr-84473.firebasestorage.app",
  messagingSenderId: "275485904635",
  appId: "1:275485904635:web:485cf955c88135fed46a5e",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
