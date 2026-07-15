import { Routes, Route } from "react-router-dom";
import CheckOuts from "./pages/CheckOuts";
import Guests from "./pages/Guests";
import Login from "./pages/Login";
import NewCheckIn from "./pages/NewCheckIn";
import PasswordEntry from "./pages/PasswordEntry";
import Payments from "./pages/Payments";
import PlaceholderPage from "./pages/PlaceholderPage";
import ReceptionistSelection from "./pages/ReceptionistSelection";
import Receipts from "./pages/Receipts";
import Reports from "./pages/Reports";
import RoleSelection from "./pages/RoleSelection";
import Settings from "./pages/Settings";
import Villas from "./pages/Villas";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelection />} />
      <Route path="/login" element={<Login />} />
      <Route path="/receptionists" element={<ReceptionistSelection />} />
      <Route path="/password" element={<PasswordEntry />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/placeholder"
        element={
          <ProtectedRoute>
            <PlaceholderPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guests"
        element={
          <ProtectedRoute>
            <Guests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guests/new"
        element={
          <ProtectedRoute>
            <NewCheckIn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guests/checkouts"
        element={
          <ProtectedRoute>
            <CheckOuts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/villas"
        element={
          <ProtectedRoute>
            <Villas />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/receipts"
        element={
          <ProtectedRoute>
            <Receipts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
