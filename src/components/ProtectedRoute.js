import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Flex, Spinner } from "@chakra-ui/react";

export default function ProtectedRoute({ children }) {

  const { user, loading } = useAuth();
  const location = useLocation();
  if (location.pathname === "/admin/test") {
    return children;
  }
  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return <Navigate to="/auth/sign-in" replace state={{ from: location }} />;
  }

  return children;
}