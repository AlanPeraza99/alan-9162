import { Route, Routes } from "react-router";
import { Home } from "~/pages/Home";
import { NotFound } from "~/pages/NotFound";
import { Register } from "~/pages/auth/Register";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/registro" element={<Register />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
