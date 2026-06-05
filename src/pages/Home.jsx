import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KeyRound, ShieldAlert, Database, Cpu, ArrowRight } from "lucide-react";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import SpeechBubble from "../components/ui/SpeechBubble";
import { useAuthStore } from "../store/authStore";
import { useSEO } from "../lib/seo";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useSEO({
    title: "Password Undo — Impenetrable Password Vault",
    description: "Monochrome, zero-knowledge client-side encrypted password generator and vault inspired by monochrome comic panels."
  });

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] bg-halftone pb-16 overflow-hidden">
      
      {/* Decorative Floating Comic Action Badges */}
      <div className="absolute top-28 left-[10%] opacity-20 pointer-events-none transform -rotate-12 select-none animate-float-slow hidden md:block">
        <span className="font-bangers text-6xl text-red-500 stroke-black dark:text-red-400">POW!</span>
      </div>
      <div className="absolute top-64 right-[12%] opacity-25 pointer-events-none transform rotate-12 select-none animate-float-slow hidden md:block" style={{ animationDelay: "1.5s" }}>
        <span className="font-bangers text-7xl text-yellow-500 dark:text-yellow-400">BAM!</span>
      </div>
      <div className="absolute bottom-40 left-[8%] opacity-20 pointer-events-none transform rotate-6 select-none animate-float-slow hidden md:block" style={{ animationDelay: "3s" }}>
        <span className="font-bangers text-6xl text-blue-500 dark:text-blue-400">ZAP!</span>
      </div>

      {/* Hero Section */}
      <section className="relative z-10 px-6 pt-16 pb-20 max-w-6xl mx-auto flex flex-col items-center text-center">
        {/* Comic Speed Line SVG Wrapper */}
        <div className="absolute top-0 inset-0 -z-10 opacity-[0.04] dark:opacity-[0.02] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="0" x2="50%" y2="50%" stroke="var(--border)" strokeWidth="3" />
            <line x1="100%" y1="0" x2="50%" y2="50%" stroke="var(--border)" strokeWidth="3" />
            <line x1="0" y1="100%" x2="50%" y2="50%" stroke="var(--border)" strokeWidth="3" />
            <line x1="100%" y1="100%" x2="50%" y2="50%" stroke="var(--border)" strokeWidth="3" />
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--border)" strokeWidth="3" />
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--border)" strokeWidth="3" />
          </svg>
        </div>

        {/* Speech Bubble Promo */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: -2 }}
          transition={{ type: "spring", stiffness: 120, delay: 0.1 }}
          className="mb-8"
        >
          <SpeechBubble tailPosition="right" className="text-sm border-red-500 dark:border-red-400 shadow-[3px_3px_0px_var(--shadow)]">
            "PSST! REUSING PASSWORDS IS A SUPERVILLAIN MOVE!"
          </SpeechBubble>
        </motion.div>

        {/* Main Hero Header */}
        <motion.h1
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          className="font-bangers text-5xl md:text-8xl tracking-widest text-[var(--text-primary)] uppercase leading-none drop-shadow-[4px_4px_0px_var(--shadow)] mb-4"
        >
          UNBREAKABLE <br />
          <span className="text-red-500 dark:text-red-400">PASSWORDS!</span>
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg md:text-xl font-mono text-[var(--text-muted)] max-w-2xl mt-4 mb-10"
        >
          A zero-knowledge client-side encrypted password manager. Ripped from a comic panel, built with military-grade key derivation.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="flex flex-wrap justify-center gap-6"
        >
          <ComicButton
            id="hero-generate-btn"
            onClick={() => navigate("/generator")}
            variant="custom"
            className="px-8 py-3.5 text-2xl bg-red-500 text-white hover:bg-black dark:hover:bg-white dark:hover:text-black shadow-[6px_6px_0px_var(--shadow)]"
            actionWord="GENERATE!"
          >
            GENERATE PASSWORD!
          </ComicButton>
          
          <ComicButton
            id="hero-access-btn"
            onClick={() => navigate(user ? "/vault" : "/login")}
            variant="secondary"
            className="px-8 py-3.5 text-2xl shadow-[6px_6px_0px_var(--shadow)]"
            actionWord={user ? "OPEN VAULT!" : "LOG IN!"}
          >
            {user ? "ACCESS VAULT!" : "SECURE LOG IN!"}
          </ComicButton>
        </motion.div>
      </section>

      {/* Comic Book Panels Section */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto py-12">
        <h2 className="font-bangers text-4xl text-center uppercase tracking-widest mb-12 select-none">
          THE <span className="text-red-500 dark:text-red-400">SECURITY FLOW</span> PANELS
        </h2>

        {/* 4-Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <ComicCard title="PANEL 1" className="h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 border-3 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-[2px_2px_0px_var(--shadow)]">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="font-bangers text-xl tracking-wider uppercase mb-2">1. GENERATE</h3>
              <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                Create ultra-entropy strings locally. Customize length, chars, symbols. Live entropy evaluation.
              </p>
            </div>
            <div className="font-marker text-xs text-red-500 dark:text-red-400 mt-6 select-none self-end">
              "SCRAMBLE! ZAP!"
            </div>
          </ComicCard>

          <ComicCard title="PANEL 2" className="h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 border-3 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-[2px_2px_0px_var(--shadow)]">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-bangers text-xl tracking-wider uppercase mb-2">2. ENCRYPT</h3>
              <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                Your Master Password is fed to PBKDF2 (100k rounds) to derive a key in-memory. Passwords encrypted using AES-256-CBC locally!
              </p>
            </div>
            <div className="font-marker text-xs text-red-500 dark:text-red-400 mt-6 select-none self-end">
              "AES-256 LOCKED!"
            </div>
          </ComicCard>

          <ComicCard title="PANEL 3" className="h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 border-3 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-[2px_2px_0px_var(--shadow)]">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-bangers text-xl tracking-wider uppercase mb-2">3. STORE</h3>
              <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                Only ciphertext blobs and random IVs leave your browser to Firestore. Zero plaintext keys are ever saved on the server!
              </p>
            </div>
            <div className="font-marker text-xs text-red-500 dark:text-red-400 mt-6 select-none self-end">
              "NO PLAIN TEXT!"
            </div>
          </ComicCard>

          <ComicCard title="PANEL 4" className="h-full flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 border-3 border-[var(--border)] bg-[var(--bg-elevated)] flex items-center justify-center mb-4 shadow-[2px_2px_0px_var(--shadow)]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="font-bangers text-xl tracking-wider uppercase mb-2">4. AUDIT</h3>
              <p className="text-xs font-mono text-[var(--text-muted)] leading-relaxed">
                Scan your credentials for breach logs anonymously using k-anonymity API checks. Check duplicates and score strength.
              </p>
            </div>
            <div className="font-marker text-xs text-red-500 dark:text-red-400 mt-6 select-none self-end">
              "SHIELD ACTIVE!"
            </div>
          </ComicCard>
        </div>
      </section>

      {/* Testimonials Panel / Quote Bubble */}
      <section className="relative z-10 px-6 max-w-4xl mx-auto py-12 flex flex-col items-center">
        <h2 className="font-bangers text-4xl text-center uppercase tracking-widest mb-10 select-none">
          WHAT THEY'RE <span className="text-red-500 dark:text-red-400">SAYING</span>
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8 items-center w-full">
          <SpeechBubble tailPosition="left" className="flex-1 border-3 border-[var(--border)]">
            "Password Undo is absolute genius. I derived a 256-bit key from my Master Password and my vault remains entirely impenetrable, even on Firestore. And the button slam-down click? Highly satisfying!"
            <div className="text-right text-xs font-mono text-[var(--text-muted)] mt-2">— EBIN, VAULT SECURITY OFFICER</div>
          </SpeechBubble>
          
          <SpeechBubble tailPosition="right" className="flex-1 border-3 border-[var(--border)]">
            "No more plaintext leaks, no unencrypted cookies. Breach check checks HIBP without leaking my password hash. Incredible! Boom!"
            <div className="text-right text-xs font-mono text-[var(--text-muted)] mt-2">— ALFRED, MASTER CODER</div>
          </SpeechBubble>
        </div>
      </section>
    </div>
  );
}
