import React from "react";
import { motion } from "framer-motion";
import { calculateEntropy, getStrengthLabel, getStrengthScore } from "../../lib/passwordUtils";

export default function StrengthMeter({ password }) {
  const entropy = calculateEntropy(password);
  const label = getStrengthLabel(entropy);
  const score = getStrengthScore(entropy);

  const getStrengthColorClass = (currentLabel) => {
    // Standard monochrome styling: we highlight active or use special text styles.
    // In our monochrome comic, we can invert the active block.
    const levels = ["WEAK", "FAIR", "STRONG", "EXCELLENT", "MILITARY GRADE"];
    const currentIndex = levels.indexOf(label);
    const targetIndex = levels.indexOf(currentLabel);
    
    if (currentIndex >= targetIndex) {
      if (label === "WEAK") return "bg-red-500 text-white dark:bg-red-650";
      if (label === "FAIR") return "bg-orange-500 text-white dark:bg-orange-600";
      if (label === "STRONG") return "bg-yellow-500 text-black";
      if (label === "EXCELLENT") return "bg-green-500 text-white dark:bg-green-600";
      return "bg-[var(--text-primary)] text-[var(--bg-primary)]"; // MILITARY GRADE
    }
    
    return "bg-transparent text-[var(--text-muted)] opacity-40";
  };

  const getMeterColor = () => {
    if (label === "WEAK") return "bg-red-500";
    if (label === "FAIR") return "bg-orange-500";
    if (label === "STRONG") return "bg-yellow-500";
    if (label === "EXCELLENT") return "bg-green-500";
    return "bg-[var(--text-primary)]";
  };

  return (
    <div className="flex flex-col gap-3 w-full font-mono text-xs">
      <div className="flex justify-between items-center">
        <span className="uppercase text-[var(--text-muted)] tracking-wider">
          Security Strength:
        </span>
        <span className="font-bangers text-lg tracking-widest text-red-500 dark:text-red-400">
          {label === "NONE" ? "EMPTY VAULT!" : `${label}! (${entropy} BITS)`}
        </span>
      </div>

      {/* Spring Animated Progress Bar */}
      <div className="relative h-6 w-full border-3 border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden shadow-[2px_2px_0px_var(--shadow)]">
        <motion.div
          className={`h-full ${getMeterColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ type: "spring", stiffness: 80, damping: 12 }}
        />
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 flex justify-between pointer-events-none">
          <div className="w-[3px] h-full bg-[var(--border)] opacity-30" style={{ left: "20%" }} />
          <div className="w-[3px] h-full bg-[var(--border)] opacity-30" style={{ left: "40%" }} />
          <div className="w-[3px] h-full bg-[var(--border)] opacity-30" style={{ left: "60%" }} />
          <div className="w-[3px] h-full bg-[var(--border)] opacity-30" style={{ left: "80%" }} />
        </div>
      </div>

      {/* Grid of Strength Badges */}
      <div className="grid grid-cols-5 border-3 border-[var(--border)] text-center font-bangers text-[10px] sm:text-xs tracking-wider uppercase divide-x-3 divide-[var(--border)] shadow-[3px_3px_0px_var(--shadow)]">
        <div className={`py-1.5 transition-colors duration-200 ${getStrengthColorClass("WEAK")}`}>
          WEAK
        </div>
        <div className={`py-1.5 transition-colors duration-200 ${getStrengthColorClass("FAIR")}`}>
          FAIR
        </div>
        <div className={`py-1.5 transition-colors duration-200 ${getStrengthColorClass("STRONG")}`}>
          STRONG
        </div>
        <div className={`py-1.5 transition-colors duration-200 ${getStrengthColorClass("EXCELLENT")}`}>
          EXCELLENT
        </div>
        <div className={`py-1.5 transition-colors duration-200 ${getStrengthColorClass("MILITARY GRADE")}`}>
          MILITARY
        </div>
      </div>
    </div>
  );
}
