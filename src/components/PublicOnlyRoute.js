import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Flex, Spinner } from "@chakra-ui/react";

export default function PublicOnlyRoute({ children }) {

  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Flex h="100vh" align="center" justify="center">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (user) {
    return <Navigate to="/admin/default" replace />;
  }

  return children;
}