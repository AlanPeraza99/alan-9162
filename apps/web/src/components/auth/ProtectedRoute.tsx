import { Navigate, Outlet } from "react-router";
import { useAuth } from "~/hooks/useAuth";

export const ProtectedRoute = () => {
  const { user } = useAuth();

  return user ? <Outlet /> : <Navigate to="/sin-permiso" replace />;
};
