import React, { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAuthStore();
  const [showFlash, setShowFlash] = useState(false);

  const handleToggle = () => {
    setShowFlash(true);
    toggleTheme();
    setTimeout(() => {
      setShowFlash(false);
    }, 250);
  };

  return (
    <>
      {/* Full screen comic flash invert */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "linear" }}
            className="fixed inset-0 z-[9999] bg-[var(--text-primary)] pointer-events-none"
          />
        )}
      </AnimatePresence>

      <button
        onClick={handleToggle}
        className="relative flex items-center justify-center gap-2 border-3 border-[var(--border)] px-4 py-1.5 font-bangers text-lg uppercase tracking-wide bg-[var(--bg-primary)] shadow-[3px_3px_0px_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all outline-none"
        title="Toggle Theme (Flash Frame!)"
      >
        <span className="relative flex items-center justify-center">
          {theme === "dark" ? (
            <Moon className="w-5 h-5 stroke-[2.5]" />
          ) : (
            <Sun className="w-5 h-5 stroke-[2.5]" />
          )}
        </span>
        <span className="text-sm">
          {theme === "dark" ? "NIGHT!" : "DAY!"}
        </span>
      </button>
    </>
  );
}
