import { createContext, useContext, useEffect, useState } from "react";
import {
  loginWithGoogle,
  loginWithEmail,
  fetchAuthenticatedUser
} from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Check authentication when app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchAuthenticatedUser();
        setUser(data?.user || null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 🔥 Google Login
  const handleGoogleLogin = async () => {
    await loginWithGoogle();

    const data = await fetchAuthenticatedUser();

    if (data?.user) {
      setUser(data.user);
    }
  };

  // 🔥 Email Login
  const handleEmailLogin = async (email, password) => {
    await loginWithEmail(email, password);

    const data = await fetchAuthenticatedUser();

    if (data?.user) {
      setUser(data.user);
    }
  };

  const logout = async () => {
    await fetch(`${process.env.REACT_APP_API_BASE}/api/auth/logout`, {
      method: "POST",
      credentials: "include"
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle: handleGoogleLogin,
        loginWithEmail: handleEmailLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);