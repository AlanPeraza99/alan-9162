import { Route, Routes } from "react-router";
import { GuestRoute } from "~/components/auth/GuestRoute";
import { ProtectedRoute } from "~/components/auth/ProtectedRoute";
import { Status } from "~/pages/Status";
import { Dashboard } from "~/pages/Dashboard";
import { Forbidden } from "~/pages/Forbidden";
import { NotFound } from "~/pages/NotFound";
import { Register } from "~/pages/auth/Register";
import { Login } from "~/pages/auth/Login";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
      </Route>

      <Route path="/estatus" element={<Status />} />
      <Route path="/sin-permiso" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
