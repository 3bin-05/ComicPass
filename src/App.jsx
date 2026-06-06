import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth, isFirebaseConfigured } from "./lib/firebase";
import { useAuthStore } from "./store/authStore";

// Pages
import Loading from "./pages/Loading";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Generator from "./pages/Generator";
import Vault from "./pages/Vault";
import Dashboard from "./pages/Dashboard";

import Intelligence from "./pages/Intelligence";

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
    // Initialize styling theme (light/dark)
    initializeTheme();

    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      await setUser(user);
    });

    return () => unsubscribe();
  }, [setUser, initializeTheme, isFirebaseConfigured]);

  // If theatrical loading is not completed, show splash screen
  if (!appReady) {
    return <Loading onComplete={() => setAppReady(true)} />;
  }

  // If Firebase configuration is missing, show a beautiful comic-styled warning UI
  if (!isFirebaseConfigured) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col justify-center items-center p-6 bg-halftone font-mono">
        <div className="w-full max-w-lg border-3 border-[var(--border)] p-8 bg-[var(--bg-card)] shadow-[8px_8px_0px_red] text-center">
          <h1 className="font-bangers text-4xl text-red-500 tracking-widest mb-4">
            ⚠️ SYSTEM ERROR: CREDENTIALS MISSING!
          </h1>
          <p className="text-[var(--text-muted)] text-sm mb-6 leading-relaxed">
            The Firebase environment variables are not configured. If you are seeing this on Vercel, please check that you have added the required variables in your Vercel Project Settings.
          </p>
          <div className="bg-[var(--bg-primary)] p-4 border border-[var(--border)] text-left text-xs text-[var(--text-muted)] select-all mb-6">
            <strong>Required Variables (Vercel Project Settings):</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_STORAGE_BUCKET</li>
              <li>VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li>VITE_FIREBASE_APP_ID</li>
            </ul>
          </div>
          <p className="text-[var(--text-muted)] text-[10px] uppercase">
            After configuring, redeploy your project on Vercel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/generator" element={<Generator />} />
          <Route path="/intelligence" element={<Intelligence />} />
          
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
