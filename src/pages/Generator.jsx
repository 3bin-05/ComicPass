import React, { useState, useEffect } from "react";
import { Copy, RefreshCw, ShieldCheck, ShieldAlert, Key, FolderHeart } from "lucide-react";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import StrengthMeter from "../components/ui/StrengthMeter";
import AddCredentialModal from "../components/vault/AddCredentialModal";
import { calculateEntropy, getCrackTimeEstimate, getCharsetSize } from "../lib/passwordUtils";
import { checkBreach } from "../lib/hibpCheck";
import { useAuthStore } from "../store/authStore";
import { useSEO } from "../lib/seo";

export default function Generator() {
  const { user } = useAuthStore();
  const [password, setPassword] = useState("");
  const [displayPassword, setDisplayPassword] = useState(""); // Used for the scramble animation
  const [length, setLength] = useState(16);
  
  // Generator Options
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  });

  // Breach Check states
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachCount, setBreachCount] = useState(null);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  // Save modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useSEO({
    title: "Password Undo — Password Generator",
    description: "Generate strong, custom, high-entropy cryptographic passwords locally with live HIBP breach scans."
  });

  // Character sets
  const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
  const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const NUMBERS = "0123456789";
  const SYMBOLS = "!@#$%^&*()_+-=[]{}|;':\",./<>?~`";
  const SIMILAR = /[il1Lo0O]/g;

  const generate = () => {
    let pool = "";
    if (options.lowercase) pool += LOWERCASE;
    if (options.uppercase) pool += UPPERCASE;
    if (options.numbers) pool += NUMBERS;
    if (options.symbols) pool += SYMBOLS;

    if (options.excludeSimilar) {
      pool = pool.replace(SIMILAR, "");
    }

    if (!pool) {
      setPassword("");
      setDisplayPassword("");
      setBreachCount(null);
      return;
    }

    let result = "";
    // Generate secure random values
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      result += pool[array[i] % pool.length];
    }

    setPassword(result);
    setBreachCount(null); // Clear previous breach checks
    triggerScramble(result);
  };

  const triggerScramble = (finalPassword) => {
    if (!finalPassword) return;
    
    let frame = 0;
    const totalFrames = 8;
    const scramblePool = LOWERCASE + UPPERCASE + NUMBERS + SYMBOLS;
    
    const interval = setInterval(() => {
      if (frame >= totalFrames) {
        clearInterval(interval);
        setDisplayPassword(finalPassword);
        return;
      }

      let scrambled = "";
      for (let i = 0; i < finalPassword.length; i++) {
        // Scramble remaining characters, but settle characters gradually
        if (i < (finalPassword.length * frame) / totalFrames) {
          scrambled += finalPassword[i];
        } else {
          scrambled += scramblePool[Math.floor(Math.random() * scramblePool.length)];
        }
      }
      setDisplayPassword(scrambled);
      frame++;
    }, 45);
  };

  // Generate on load
  useEffect(() => {
    generate();
  }, [length, options.lowercase, options.uppercase, options.numbers, options.symbols, options.excludeSimilar]);

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
  };

  const handleBreachCheck = async () => {
    if (!password) return;
    setIsCheckingBreach(true);
    setBreachCount(null);
    
    try {
      const count = await checkBreach(password);
      setBreachCount(count);
      if (count > 0) {
        setShakeTrigger(true);
        setTimeout(() => setShakeTrigger(false), 600);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsCheckingBreach(false);
    }
  };

  const handleOptionChange = (key) => {
    setOptions((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      // Prevent turning off all toggles
      if (!updated.lowercase && !updated.uppercase && !updated.numbers && !updated.symbols) {
        return prev;
      }
      return updated;
    });
  };

  const entropy = calculateEntropy(password);
  const crackTime = getCrackTimeEstimate(password);
  const charsetSize = getCharsetSize(password);

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] bg-halftone py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Page title */}
        <div className="text-center">
          <h1 className="font-bangers text-4xl sm:text-6xl tracking-widest uppercase mb-2 drop-shadow-[2px_2px_0px_var(--shadow)]">
            PASSWORD <span className="text-red-500 dark:text-red-400">GENERATOR</span>
          </h1>
          <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
            FORGE INDUSTRIAL GRADE CREDENTIALS IN REAL-TIME
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Settings */}
          <div className="col-span-1 md:col-span-6 flex flex-col gap-6">
            <ComicCard title="FORGE PARAMETERS" className="w-full">
              {/* Length Slider */}
              <div className="flex flex-col gap-2 mb-6">
                <div className="flex justify-between font-bangers text-lg tracking-wider text-[var(--text-primary)]">
                  <span id="generator-length-label">CHAR LENGTH:</span>
                  <span className="text-red-500 dark:text-red-400 font-mono text-xl">{length}</span>
                </div>
                <input
                  id="generator-length-slider"
                  type="range"
                  min="8"
                  max="128"
                  value={length}
                  aria-labelledby="generator-length-label"
                  onChange={(e) => setLength(parseInt(e.target.value))}
                  className="w-full h-3 border-3 border-[var(--border)] bg-[var(--bg-elevated)] appearance-none cursor-pointer accent-black dark:accent-white shadow-[1px_1px_0px_var(--shadow)]"
                />
                <div className="flex justify-between font-mono text-[9px] text-[var(--text-muted)] mt-1 uppercase">
                  <span>8 chars (weakling)</span>
                  <span>128 chars (tank)</span>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    id="checkbox-uppercase"
                    type="checkbox"
                    checked={options.uppercase}
                    onChange={() => handleOptionChange("uppercase")}
                    className="w-6 h-6 border-3 border-[var(--border)] rounded-none bg-[var(--bg-primary)] text-[var(--text-primary)] accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-bangers text-lg tracking-wide uppercase">A-Z (UPPERCASE)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    id="checkbox-lowercase"
                    type="checkbox"
                    checked={options.lowercase}
                    onChange={() => handleOptionChange("lowercase")}
                    className="w-6 h-6 border-3 border-[var(--border)] rounded-none bg-[var(--bg-primary)] text-[var(--text-primary)] accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-bangers text-lg tracking-wide uppercase">a-z (lowercase)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    id="checkbox-numbers"
                    type="checkbox"
                    checked={options.numbers}
                    onChange={() => handleOptionChange("numbers")}
                    className="w-6 h-6 border-3 border-[var(--border)] rounded-none bg-[var(--bg-primary)] text-[var(--text-primary)] accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-bangers text-lg tracking-wide uppercase">0-9 (NUMBERS)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    id="checkbox-symbols"
                    type="checkbox"
                    checked={options.symbols}
                    onChange={() => handleOptionChange("symbols")}
                    className="w-6 h-6 border-3 border-[var(--border)] rounded-none bg-[var(--bg-primary)] text-[var(--text-primary)] accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-bangers text-lg tracking-wide uppercase">#$&! (SYMBOLS)</span>
                </label>

                <hr className="border-[var(--border)] border-t-2 border-dashed my-2" />

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    id="generator-exclude-similar-checkbox"
                    type="checkbox"
                    checked={options.excludeSimilar}
                    onChange={() => handleOptionChange("excludeSimilar")}
                    className="w-6 h-6 border-3 border-[var(--border)] rounded-none bg-[var(--bg-primary)] text-[var(--text-primary)] accent-black dark:accent-white cursor-pointer"
                  />
                  <span className="font-bangers text-md tracking-wide uppercase text-[var(--text-muted)]">
                    EXCLUDE SIMILAR CHARS (e.g. i, l, 1, 0, O)
                  </span>
                </label>
              </div>

              {/* Force Regenerate Button */}
              <ComicButton
                id="generator-reforge-btn"
                onClick={generate}
                className="w-full mt-6 py-3 flex items-center justify-center gap-2"
                actionWord="FORGE!"
              >
                <RefreshCw className="w-5 h-5 stroke-[2.5]" />
                RE-FORGE KEYSPAN!
              </ComicButton>
            </ComicCard>
          </div>

          {/* Right Column: Display, Strength & Audit */}
          <div className="col-span-1 md:col-span-6 flex flex-col gap-6">
            
            {/* Output Card */}
            <ComicCard
              title="GENERATED OUTPUT"
              className={`w-full transition-all duration-300
                ${shakeTrigger ? "animate-comic-shake" : ""}
                ${breachCount > 0 ? "border-red-500 shadow-[6px_6px_0px_rgba(239,68,68,1)] animate-border-flash-red" : ""}`}
            >
              {/* Display Box */}
              <div className="relative flex items-center w-full mb-6">
                <input
                  id="generator-output-input"
                  type="text"
                  value={displayPassword}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setDisplayPassword(e.target.value);
                    setBreachCount(null); // Clear checks since user modified it
                  }}
                  className="w-full border-3 border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] pl-4 pr-14 py-3.5 font-mono text-base md:text-lg select-all outline-none shadow-[3px_3px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[2px_2px_0px_var(--shadow)]"
                  placeholder="Custom secret key..."
                />
                <ComicButton
                  id="generator-copy-btn"
                  onClick={handleCopy}
                  variant="secondary"
                  className="absolute right-2.5 p-2 h-[80%] border-2 flex items-center justify-center active:translate-x-[2px] active:translate-y-[2px]"
                  actionWord="COPIED!"
                  title="Copy password to clipboard"
                >
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                </ComicButton>
              </div>

              {/* Strength Meter */}
              <StrengthMeter password={password} />

              {/* Statistical readouts */}
              <div className="grid grid-cols-2 gap-4 mt-6 border-2 border-[var(--border)] p-4 bg-[var(--bg-primary)] text-xs font-mono shadow-[2px_2px_0px_var(--shadow)]">
                <div className="flex flex-col gap-1 border-r border-[var(--border)] pr-2">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Pool size:</span>
                  <span className="font-bold text-sm text-[var(--text-primary)]">{charsetSize} characters</span>
                </div>
                <div className="flex flex-col gap-1 pl-2">
                  <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Est. Crack Time:</span>
                  <span className="font-bold text-sm text-[var(--text-primary)] truncate" title={crackTime}>
                    {crackTime}
                  </span>
                </div>
              </div>

              {/* Action buttons (Breach, Save) */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                {/* HIBP Breach Checker */}
                <ComicButton
                  id="generator-breach-btn"
                  onClick={handleBreachCheck}
                  disabled={isCheckingBreach || !password}
                  variant="secondary"
                  className="flex-1 py-3 text-base"
                  actionWord="CHECKING!"
                >
                  {isCheckingBreach ? "CHECKING HIBP..." : "TEST BREACH LOGS!"}
                </ComicButton>

                {/* Save button */}
                <ComicButton
                  id="generator-save-btn"
                  onClick={() => setIsSaveModalOpen(true)}
                  disabled={!password}
                  variant="danger"
                  className="flex-1 py-3 text-base"
                  actionWord="SAVE!"
                >
                  <FolderHeart className="w-5 h-5 inline mr-1" />
                  SAVE TO VAULT!
                </ComicButton>
              </div>

              {/* HIBP results banner */}
              {breachCount !== null && (
                <div
                  className={`mt-4 border-3 p-3 font-bangers tracking-wider text-center text-lg shadow-[2px_2px_0px_rgba(0,0,0,0.15)]
                    ${breachCount > 0 
                      ? "bg-red-100 border-red-500 text-red-700 dark:bg-red-950 dark:text-red-300" 
                      : "bg-green-100 border-green-500 text-green-700 dark:bg-green-950 dark:text-green-300"}`}
                >
                  {breachCount > 0 ? (
                    <>
                      <ShieldAlert className="w-5 h-5 inline mr-1.5 stroke-[2.5]" />
                      ⚠ BREACH DETECTED — FOUND IN {breachCount.toLocaleString()} KNOWN LEAKS!
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 inline mr-1.5 stroke-[2.5]" />
                      ✓ ALL CLEAR — PASSWORD IS SAFE TO USE!
                    </>
                  )}
                </div>
              )}
            </ComicCard>

          </div>
        </div>
      </div>

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        initialPassword={password}
        onSaveSuccess={() => {
          // Display success state if needed
          alert("Credential successfully encrypted and stored in vault!");
        }}
      />
    </div>
  );
}
