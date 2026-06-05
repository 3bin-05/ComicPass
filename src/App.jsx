import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useAuthStore } from "./store/authStore";

// Pages
import Loading from "./pages/Loading";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Generator from "./pages/Generator";
import Vault from "./pages/Vault";
import Dashboard from "./pages/Dashboard";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

// Route protection guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex justify-center items-center font-bangers text-3xl tracking-widest text-[var(--text-primary)]">
        LOADING DATA CORE...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// Layout wrapper that handles scroll resets and layout structure
function LayoutWrapper({ children }) {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  const [appReady, setAppReady] = useState(false);
  const { setUser, initializeTheme, loading } = useAuthStore();

  // 1. Subscribe to Firebase Auth changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await setUser(user);
    });

    // 2. Initialize styling theme (light/dark)
    initializeTheme();

    return () => unsubscribe();
  }, [setUser, initializeTheme]);

  // If theatrical loading is not completed, show splash screen
  if (!appReady) {
    return <Loading onComplete={() => setAppReady(true)} />;
  }

  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/generator" element={<Generator />} />
          
          <Route
            path="/vault"
            element={
              <PrivateRoute>
                <Vault />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}
