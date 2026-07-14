import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App";
import { GuestProvider } from "./context/GuestContext";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <GuestProvider>
        <App />
      </GuestProvider>
    </AuthProvider>
  </BrowserRouter>
);
