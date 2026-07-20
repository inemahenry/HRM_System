import { Navigate, Routes, Route } from "react-router-dom";
import CheckOuts from "./pages/CheckOuts";
import Guests from "./pages/Guests";
import NewCheckIn from "./pages/NewCheckIn";
import Payments from "./pages/Payments";
import Receipts from "./pages/Receipts";
import Settings from "./pages/Settings";
import Villas from "./pages/Villas";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/guests" element={<Guests />} />
      <Route path="/guests/new" element={<NewCheckIn />} />
      <Route path="/guests/checkouts" element={<CheckOuts />} />
      <Route path="/villas" element={<Villas />} />
      <Route path="/payments" element={<Payments />} />
      <Route path="/receipts" element={<Receipts />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
