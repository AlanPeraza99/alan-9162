import { useState } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export const ProtectedRoute = () => {
  const { user } = useAuth();
  const [hadSession] = useState(Boolean(user));

  if (user) {
    return <Outlet />;
  }

  return <Navigate to={hadSession ? "/" : "/sin-permiso"} replace />;
};
