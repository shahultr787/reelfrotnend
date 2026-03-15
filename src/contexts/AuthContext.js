/**
 * contexts/AuthContext.js
 *
 * Changes vs previous version:
 *  ✅  Login functions check isProfileCompleted from backend response
 *  ✅  Incomplete profile → navigate to /complete-profile (not /admin/default)
 *  ✅  isProfileCompleted stored in context so ProtectedRoute can read it
 *  ✅  checkAuth on load also reads is_profile_completed from profile data
 */

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  fetchAuthenticatedUser,
} from "../services/authService";
import { apiFetch } from "../utils/apiFetch";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                         = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [isProfileCompleted, setIsProfileCompleted] = useState(false);
  const navigate                                = useNavigate();

  /* ── Shared: after any login, decide where to go ─────── */
  const afterLogin = useCallback((profile, loginMeta = {}) => {
    setUser(profile || null);

    // loginMeta comes from the /api/auth/login response (isProfileCompleted field)
    // profile comes from /api/profile (is_profile_completed column)
    // We check both — loginMeta is fresher right after login
    const completed =
      loginMeta.isProfileCompleted ??
      profile?.is_profile_completed ??
      false;

    setIsProfileCompleted(!!completed);

    if (!completed) {
      navigate("/complete-profile", { replace: true });
    } else {
      navigate("/admin/default", { replace: true });
    }
  }, [navigate]);

  /* ── Check session on app load ───────────────────────── */
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await fetchAuthenticatedUser();
        // data = { success: true, profile: { ..., is_profile_completed: true/false } }
        const profile = data?.profile || null;
        setUser(profile);
        setIsProfileCompleted(!!profile?.is_profile_completed);
      } catch {
        setUser(null);
        setIsProfileCompleted(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  /* ── Google Login ────────────────────────────────────── */
  const handleGoogleLogin = useCallback(async () => {
    // loginWithGoogle returns the /api/auth/login response
    // which includes { isProfileCompleted, isNewUser, ... }
    const loginResponse = await loginWithGoogle();
    const data          = await fetchAuthenticatedUser();
    afterLogin(data?.profile || null, loginResponse);
  }, [afterLogin]);

  /* ── Email Login ─────────────────────────────────────── */
  const handleEmailLogin = useCallback(async (email, password) => {
    const loginResponse = await loginWithEmail(email, password);
    const data          = await fetchAuthenticatedUser();
    afterLogin(data?.profile || null, loginResponse);
  }, [afterLogin]);

  /* ── Email Register ──────────────────────────────────── */
  const handleRegister = useCallback(async (name, email, password) => {
    const loginResponse = await registerWithEmail(name, email, password);
    const data          = await fetchAuthenticatedUser();
    afterLogin(data?.profile || null, loginResponse);
  }, [afterLogin]);

  /* ── Called by profile page after successful completion ─
   *  Lets the rest of the app know the profile is now done
   *  without a full page reload.
   * ───────────────────────────────────────────────────── */
  const markProfileCompleted = useCallback(() => {
    setIsProfileCompleted(true);
    setUser(prev => prev ? { ...prev, is_profile_completed: true } : prev);
  }, []);

  /* ── Logout ──────────────────────────────────────────── */
  const logout = useCallback(async () => {
    try {
      await apiFetch("/api/auth/logout", { method: "POST" });
    } catch {
      // best-effort — clear local state regardless
    }
    setUser(null);
    setIsProfileCompleted(false);
    navigate("/auth/sign-in", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isProfileCompleted,
        loginWithGoogle:      handleGoogleLogin,
        loginWithEmail:       handleEmailLogin,
        registerWithEmail:    handleRegister,
        markProfileCompleted,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);