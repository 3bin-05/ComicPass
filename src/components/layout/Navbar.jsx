import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Menu, X, Lock, Unlock } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import ThemeToggle from "../ui/ThemeToggle";

export default function Navbar() {
  const { user, vaultUnlocked, lockVault, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const linkClass = ({ isActive }) => 
    `font-bangers text-lg uppercase tracking-wider px-3 py-1.5 transition-all
     ${isActive 
       ? "bg-[var(--text-primary)] text-[var(--bg-primary)] border-2 border-[var(--border)]" 
       : "hover:bg-[var(--bg-elevated)]"}`;

  return (
    <nav className="relative z-40 bg-[var(--bg-primary)] border-b-3 border-[var(--border)] py-4 px-6 md:px-12 flex justify-between items-center">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2 select-none group">
        <span className="font-bangers text-3xl tracking-widest text-[var(--text-primary)] transition-transform group-hover:scale-105">
          PASSWORD<span className="text-red-500 dark:text-red-400">UNDO</span>
        </span>
        <div className="hidden sm:block font-marker text-xs border border-[var(--border)] px-1.5 py-0.5 rounded-md rotate-[-2deg] bg-[var(--bg-elevated)] shadow-[1px_1px_0px_var(--shadow)]">
          ISSUE #1
        </div>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center gap-6">
        <NavLink to="/generator" className={linkClass}>
          Generator
        </NavLink>
        
        {user && (
          <>
            <NavLink to="/vault" className={linkClass}>
              Vault
            </NavLink>
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
          </>
        )}
      </div>

      {/* Right Actions (Theme, Lock/Unlock, Auth) */}
      <div className="hidden md:flex items-center gap-4">
        <ThemeToggle />

        {user ? (
          <div className="flex items-center gap-3">
            {/* Lock/Unlock Vault State Badge */}
            <button
              onClick={vaultUnlocked ? () => { lockVault(); navigate("/vault"); } : () => navigate("/vault")}
              className={`flex items-center gap-1.5 px-3 py-1.5 font-bangers text-sm border-2 border-[var(--border)] uppercase tracking-wide shadow-[2px_2px_0px_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                ${vaultUnlocked ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
              title={vaultUnlocked ? "Vault Unlocked (Click to lock)" : "Vault Locked (Click to unlock)"}
            >
              {vaultUnlocked ? (
                <>
                  <Unlock className="w-4 h-4" />
                  UNLOCKED
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  LOCKED
                </>
              )}
            </button>

            <button
              onClick={handleLogout}
              className="font-bangers text-lg border-3 border-[var(--border)] px-4 py-1.5 uppercase tracking-wide bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0px_var(--shadow)] hover:bg-red-600 dark:hover:bg-red-600 hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all outline-none"
            >
              LOGOUT!
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="font-bangers text-lg border-3 border-[var(--border)] px-4 py-1.5 uppercase tracking-wide bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all outline-none"
            >
              LOGIN!
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Toggle Button */}
      <div className="flex items-center gap-3 md:hidden">
        <ThemeToggle />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 border-3 border-[var(--border)] shadow-[2px_2px_0px_var(--shadow)] bg-[var(--bg-primary)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="absolute top-[75px] left-0 right-0 z-50 bg-[var(--bg-primary)] border-b-3 border-[var(--border)] flex flex-col p-6 gap-4 shadow-[0_10px_20px_rgba(0,0,0,0.15)] md:hidden">
          <NavLink to="/generator" onClick={() => setIsOpen(false)} className={linkClass}>
            Generator
          </NavLink>
          {user && (
            <>
              <NavLink to="/vault" onClick={() => setIsOpen(false)} className={linkClass}>
                Vault
              </NavLink>
              <NavLink to="/dashboard" onClick={() => setIsOpen(false)} className={linkClass}>
                Dashboard
              </NavLink>
            </>
          )}

          <hr className="border-[var(--border)] border-t-2" />

          {user ? (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (vaultUnlocked) {
                    lockVault();
                  }
                  navigate("/vault");
                }}
                className={`flex justify-center items-center gap-1.5 py-2.5 font-bangers text-lg border-3 border-[var(--border)] uppercase tracking-wide shadow-[3px_3px_0px_var(--shadow)]
                  ${vaultUnlocked ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
              >
                {vaultUnlocked ? (
                  <>
                    <Unlock className="w-5 h-5" />
                    VAULT UNLOCKED
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    VAULT LOCKED
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="font-bangers text-lg text-center border-3 border-[var(--border)] py-2.5 uppercase tracking-wide bg-black text-white dark:bg-white dark:text-black shadow-[3px_3px_0px_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all outline-none"
              >
                LOGOUT!
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="font-bangers text-lg text-center border-3 border-[var(--border)] py-2.5 uppercase tracking-wide bg-[var(--bg-primary)] text-[var(--text-primary)] shadow-[3px_3px_0px_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all outline-none"
            >
              LOGIN!
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
