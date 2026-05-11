import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import "./styles/global.css";

import ProtectedRoute from "./components/ProtectedRoute";
import Navbar         from "./components/Navbar";
import AuthPage       from "./pages/AuthPage";
import Dashboard      from "./pages/Dashboard";
import LogTrade       from "./pages/LogTrade";
import History        from "./pages/History";
import Review         from "./pages/Review";

// Layout wraps protected pages with the navbar
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<AuthPage />} />

        {/* Protected */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/log" element={
          <ProtectedRoute>
            <Layout><LogTrade /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Layout><History /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/review" element={
          <ProtectedRoute>
            <Layout><Review /></Layout>
          </ProtectedRoute>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
