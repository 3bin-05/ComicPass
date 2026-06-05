import React from "react";

export default function Footer() {
  return (
    <footer className="bg-[var(--bg-primary)] border-t-3 border-[var(--border)] py-8 px-6 mt-auto text-center relative z-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="font-bangers text-2xl tracking-widest text-[var(--text-primary)]">
            COMIC<span className="text-red-500 dark:text-red-400">PASS</span>
          </div>
          <p className="text-xs font-mono text-[var(--text-muted)] mt-1">
            © {new Date().getFullYear()} COMICPASS INC. ALL RIGHTS RESERVED.
          </p>
        </div>

        {/* Small Speech Bubble inside Footer */}
        <div className="relative border-2 border-[var(--border)] px-4 py-2 font-marker text-xs rounded-xl bg-[var(--bg-card)] shadow-[2px_2px_0px_var(--shadow)] max-w-xs rotate-[-1deg] select-none">
          "ZERO-KNOWLEDGE. CLIENT-SIDE ONLY! FIRESTORE CAN'T SEE SQUAT!"
        </div>

        <div className="flex gap-4 font-bangers text-sm text-[var(--text-muted)]">
          <span className="border border-[var(--border)] px-2 py-0.5 bg-[var(--bg-elevated)]">
            VOL. 1
          </span>
          <span className="border border-[var(--border)] px-2 py-0.5 bg-[var(--bg-elevated)]">
            NO. 1
          </span>
          <span className="border border-[var(--border)] px-2 py-0.5 bg-[var(--bg-elevated)]">
            APPROVED BY COMIC AUTH CODE
          </span>
        </div>
      </div>
    </footer>
  );
}
