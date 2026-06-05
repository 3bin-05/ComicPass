import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CAPTIONS = [
  "[ ENCRYPTING DATA... ]",
  "[ SECURING SESSION... ]",
  "[ LOADING VAULT... ]",
  "[ ACCESSING CORES... ]",
];

export default function Loading({ onComplete }) {
  const [asterisks, setAsterisks] = useState("");
  const [captionIndex, setCaptionIndex] = useState(0);
  const [showAccess, setShowAccess] = useState(false);

  // 1. Animate asterisks character-by-character
  useEffect(() => {
    const maxAsterisks = 12;
    const interval = setInterval(() => {
      setAsterisks((prev) => {
        if (prev.length >= maxAsterisks) {
          clearInterval(interval);
          setTimeout(() => setShowAccess(true), 400); // Proceed to Access Granted
          return prev;
        }
        return prev + "*";
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  // 2. Cycle captions
  useEffect(() => {
    if (showAccess) return;
    const interval = setInterval(() => {
      setCaptionIndex((prev) => (prev + 1) % CAPTIONS.length);
    }, 500);

    return () => clearInterval(interval);
  }, [showAccess]);

  // 3. Trigger completion after ACCESS GRANTED plays
  useEffect(() => {
    if (showAccess) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2400); // Gives time for stagger reveal to display
      return () => clearTimeout(timer);
    }
  }, [showAccess, onComplete]);

  // Split word for stagger letter reveal
  const titleText = "ACCESS GRANTED";
  const words = titleText.split("");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, scale: 0, y: 50, rotate: -20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center items-center p-6 text-white bg-halftone">
      
      {/* Decorative Speed Lines during Loading */}
      {!showAccess && (
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(90deg,transparent_49.5%,#fff_50%,transparent_50.5%)] bg-[length:40px_100%] pointer-events-none" />
      )}

      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!showAccess ? (
            <motion.div
              key="loader"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              {/* Fake Password Field */}
              <div className="w-full border-3 border-white p-4 bg-zinc-950 flex items-center h-16 font-mono text-3xl tracking-widest text-red-500 font-bold shadow-[6px_6px_0px_rgba(255,255,255,1)]">
                {asterisks}
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-3.5 h-7 bg-red-500 ml-1"
                />
              </div>

              {/* Cycling Captions */}
              <div className="h-10 mt-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={captionIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-bangers text-xl tracking-widest text-zinc-400"
                  >
                    {CAPTIONS[captionIndex]}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="access"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center"
            >
              {/* ACCESS GRANTED STAGGER */}
              <div className="flex flex-nowrap justify-center gap-1 sm:gap-2 select-none whitespace-nowrap">
                {words.map((char, index) => (
                  <motion.span
                    key={index}
                    variants={letterVariants}
                    className={`font-bangers text-3xl sm:text-6xl md:text-7xl tracking-tighter px-1.5 py-0.5
                      ${char === " " ? "w-4 sm:w-8" : "border-2 sm:border-3 border-white bg-red-600 text-white shadow-[2px_2px_0px_white] sm:shadow-[4px_4px_0px_white]"}
                      transform ${index % 2 === 0 ? "rotate-[-3deg]" : "rotate-[3deg]"}`}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Action caption bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
                className="mt-10 border-3 border-white bg-white text-black font-marker px-6 py-2 rotate-[-1deg] text-lg shadow-[4px_4px_0px_red]"
              >
                "VAULT DECRYPTED, HERO!"
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
