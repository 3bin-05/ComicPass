import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthStore } from "../store/authStore";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import { useSEO } from "../lib/seo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  useSEO({
    title: "Password Undo — Portal Login",
    description: "Unlock your Password Undo password vault and access your encrypted credentials core secure and anonymous."
  });

  // If already logged in, redirect to vault
  useEffect(() => {
    if (user) {
      navigate("/vault");
    }
  }, [user, navigate]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("ENTER BOTH FIELDS, HERO!");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await setUser(userCredential.user);
      navigate("/vault");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("INVALID CREDENTIALS! SYSTEM LOCKED!");
      } else {
        setError(err.message.replace("Firebase:", "").toUpperCase());
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
      <h1 className="sr-only">Sign In to Password Undo Password Vault</h1>
      
      <div className="w-full max-w-md">
        <ComicCard title="IDENTIFY USER!" className="relative">
          <h2 className="font-bangers text-3xl tracking-widest text-center uppercase mb-6 select-none">
            SECURE ACCESS PORTAL
          </h2>

          {error && (
            <div className="mb-6 border-3 border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs p-3 font-bold uppercase tracking-wider animate-comic-shake">
              ⚠ ERROR: {error}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] transition-all"
                placeholder="superhero@passwordundo.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] transition-all"
                placeholder="••••••••••••"
              />
            </div>

            <ComicButton
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full py-3 text-xl mt-3"
              actionWord="VERIFY!"
            >
              {loading ? "VERIFYING..." : "UNLOCK PASSWAY!"}
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
            id="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
            variant="secondary"
            className="w-full py-2.5 text-lg flex items-center justify-center gap-2"
            actionWord="GOOGLE!"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.985 0-.74-.078-1.3-.173-1.854h-10.62z" />
            </svg>
            SIGN IN WITH GOOGLE
          </ComicButton>

          <p className="text-center font-mono text-xs text-[var(--text-muted)] mt-6">
            NEW HERO IN TOWN?{" "}
            <Link
              to="/register"
              className="text-red-500 hover:underline font-bold font-bangers tracking-wider uppercase text-sm"
            >
              REGISTER HERE!
            </Link>
          </p>
        </ComicCard>
      </div>
    </div>
  );
}
