// ============================================
// Protected Route — Firebase RBAC Guard
// ============================================

import { Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../lib/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
}

/**
 * Route guard that checks Firebase authentication and optional role requirement.
 * Redirects to /login if not authenticated, or shows 403 if role is insufficient.
 */
export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { user, loading, role } = useAuth();

  if (loading) {
    return (
      <Center h="60vh">
        <Loader color="green" size="lg" />
      </Center>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && role && !requiredRoles.includes(role)) {
    return (
      <Center h="60vh">
        <div style={{ textAlign: "center" }}>
          <h2>🚫 Access Denied</h2>
          <p>You need one of these roles: {requiredRoles.join(", ")}</p>
        </div>
      </Center>
    );
  }

  return <>{children}</>;
}
