import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import { useSEO } from "../lib/seo";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  useSEO({
    title: "Password Undo — Enroll Hero",
    description: "Create a new Password Undo account and set up client-side zero-knowledge password encryption."
  });

  useEffect(() => {
    if (user) {
      navigate("/vault");
    }
  }, [user, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError("FILL IN ALL FIELDS, SOLDIER!");
      return;
    }
    if (password !== confirmPassword) {
      setError("PASSWORDS DO NOT MATCH! ANOMALY!");
      return;
    }
    if (password.length < 6) {
      setError("PASSWORD TOO SHORT! MINIMUM 6 CHARACTERS!");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setUser(userCredential.user);
      navigate("/vault");
    } catch (err) {
      console.error(err);
      setError(err.message.replace("Firebase:", "").toUpperCase());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await setUser(result.user);
      navigate("/vault");
    } catch (err) {
      console.error(err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message.toUpperCase());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] bg-halftone py-16 px-6 flex justify-center items-center">
      <h1 className="sr-only">Password Undo New Account Registration</h1>
      <div className="w-full max-w-md">
        <ComicCard title="NEW RECRUIT!" className="relative">
          <h2 className="font-bangers text-3xl tracking-widest text-center uppercase mb-6 select-none">
            HERO ENLISTMENT PORTAL
          </h2>

          {error && (
            <div className="mb-6 border-3 border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs p-3 font-bold uppercase tracking-wider animate-comic-shake">
              ⚠ WARNING: {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-email" className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                Email Address
              </label>
              <input
                id="register-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] transition-all"
                placeholder="superhero@passwordundo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-password" className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                Create Password
              </label>
              <input
                id="register-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="register-confirm-password" className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <ComicButton
              id="register-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xl mt-3"
              actionWord="ENLIST!"
            >
              {loading ? "ENLISTING..." : "CREATE SECURE ACCOUNT!"}
            </ComicButton>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[var(--border)] border-dashed"></div>
            </div>
            <span className="relative px-3 bg-[var(--bg-card)] font-bangers text-xs text-[var(--text-muted)] uppercase tracking-widest">
              OR
            </span>
          </div>

          {/* Google Sign In */}
          <ComicButton
            id="google-register-btn"
            onClick={handleGoogleSignup}
            disabled={loading}
            variant="secondary"
            className="w-full py-2.5 text-lg flex items-center justify-center gap-2"
            actionWord="GOOGLE!"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.078-1.3-.173-1.854h-10.62z" />
            </svg>
            ENLIST WITH GOOGLE
          </ComicButton>

          <p className="text-center font-mono text-xs text-[var(--text-muted)] mt-6">
            ALREADY ENLISTED?{" "}
            <Link
              to="/login"
              className="text-red-500 hover:underline font-bold font-bangers tracking-wider uppercase text-sm"
            >
              LOGIN HERE!
            </Link>
          </p>
        </ComicCard>
      </div>
    </div>
  );
}
