import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_WORDS = ["CLICK!", "BAM!", "POW!", "ZAP!", "BOOM!", "KAPOW!", "WHOOSH!"];

export default function ComicButton({
  children,
  onClick,
  className = "",
  type = "button",
  disabled = false,
  variant = "primary", // primary, secondary, danger
  actionWord, // Custom word to display on click (e.g. "COPIED!")
  ...props
}) {
  const [clicks, setClicks] = useState([]);

  const handleClick = (e) => {
    if (disabled) return;

    // Pick action word
    const word = actionWord || DEFAULT_WORDS[Math.floor(Math.random() * DEFAULT_WORDS.length)];

    // Get click coordinates relative to the button
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newClick = {
      id: Date.now() + Math.random(),
      word,
      x,
      y,
      rotation: Math.random() * 30 - 15, // random rotation between -15 and 15 deg
    };

    setClicks((prev) => [...prev, newClick]);
    
    if (onClick) {
      onClick(e);
    }
  };

  // Remove action word after animation finishes
  const handleAnimationComplete = (id) => {
    setClicks((prev) => prev.filter((c) => c.id !== id));
  };

  const getVariantStyles = () => {
    if (variant === "custom") {
      return "";
    }
    if (variant === "danger") {
      return "bg-red-500 text-white hover:bg-red-650 dark:hover:bg-red-600 border-[var(--border)]";
    }
    if (variant === "secondary") {
      return "bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border-[var(--border)]";
    }
    // Primary (Inverted Monochrome block)
    return "bg-[var(--text-primary)] text-[var(--bg-primary)] hover:bg-[var(--text-muted)] border-[var(--border)]";
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`relative select-none font-bangers text-xl tracking-wider uppercase border-3 px-6 py-2.5 outline-none transition-all duration-100
        comic-shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
        ${getVariantStyles()} ${className}`}
      {...props}
    >
      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      {/* Floating Action Words */}
      <AnimatePresence>
        {clicks.map((click) => (
          <motion.span
            key={click.id}
            initial={{ opacity: 1, scale: 0.6, y: click.y - 12, x: click.x - 20 }}
            animate={{ 
              opacity: [1, 1, 0], 
              scale: [0.6, 1.4, 1.2], 
              y: click.y - 80,
              x: click.x + (click.rotation * 1.5) - 20,
              rotate: click.rotation 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            onAnimationComplete={() => handleAnimationComplete(click.id)}
            className="absolute z-50 font-marker text-2xl text-red-500 dark:text-red-400 pointer-events-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] dark:drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]"
            style={{ left: 0, top: 0 }}
          >
            {click.word}
          </motion.span>
        ))}
      </AnimatePresence>
    </button>
  );
}
