/**
 * components/PublicOnlyRoute.jsx
 *
 * Wraps auth pages (sign-in, register).
 * If user is already logged in → redirect to dashboard.
 * Prevents logged-in users from seeing the sign-in page.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Flex, Spinner } from "@chakra-ui/react";

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  if (user) {
    return <Navigate to="/admin/default" replace />;
  }

  return children;
}
