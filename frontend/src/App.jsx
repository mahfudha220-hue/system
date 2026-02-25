import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import InvoiceListPage from "./pages/InvoiceListPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import ReportsPage from "./pages/ReportsPage";
import BackupsPage from "./pages/BackupsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

function AppLayout({ children }) {
  return <><Navbar />{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePasswordPage /></ProtectedRoute>} />
        <Route path="/" element={<ProtectedRoute><AppLayout><InvoiceListPage /></AppLayout></ProtectedRoute>} />
        <Route path="/invoices/:id" element={<ProtectedRoute><AppLayout><InvoiceDetailPage /></AppLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={["manager", "admin"]}><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
        <Route path="/backups" element={<ProtectedRoute roles={["admin"]}><AppLayout><BackupsPage /></AppLayout></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
