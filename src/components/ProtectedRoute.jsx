/**
 * components/ProtectedRoute.jsx
 *
 * Three-layer guard:
 *  1. Still loading auth state  → show spinner
 *  2. Not logged in             → redirect to /auth/sign-in
 *  3. Profile incomplete        → redirect to /complete-profile
 *     (only if requireProfile is true, which is the default)
 *
 * Usage:
 *   <ProtectedRoute>              ← requires login + complete profile
 *   <ProtectedRoute requireProfile={false}>  ← requires login only
 *                                              (use for /complete-profile itself!)
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Flex, Spinner } from "@chakra-ui/react";

export default function ProtectedRoute({ children, requireProfile = true }) {
  const { user, loading, isProfileCompleted } = useAuth();

  /* Still determining auth state */
  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  /* Not logged in */
  if (!user) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  /* Logged in but profile not finished — block all feature pages */
  if (requireProfile && !isProfileCompleted) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}