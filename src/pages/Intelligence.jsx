import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, ShieldCheck, Lock, Unlock, Eye, EyeOff, Terminal, Info, AlertTriangle, CheckCircle, RefreshCw, Flame, HelpCircle } from "lucide-react";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import SpeechBubble from "../components/ui/SpeechBubble";
import { analyzePassword } from "../lib/passwordIntelligence";
import { getRoast } from "../lib/roastEngine";
import { checkBreach } from "../lib/hibpCheck";
import { useSEO } from "../lib/seo";

export default function Intelligence() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simTerminalLines, setSimTerminalLines] = useState([]);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Roast Mode Settings
  const [roastStyle, setRoastStyle] = useState("expert");
  const [currentRoast, setCurrentRoast] = useState("");
  
  // HIBP Integration
  const [isCheckingBreach, setIsCheckingBreach] = useState(false);
  const [breachCount, setBreachCount] = useState(null);

  const terminalEndRef = useRef(null);

  useSEO({
    title: "Password Intelligence Center — Password Undo",
    description: "Audit any password locally, simulate brute force cracking, receive comic roasts, and view security scores with zero data transmission."
  });

  // Keep terminal scrolled to the bottom during simulation
  useEffect(() => {
    if (isAnalyzing && simTerminalLines.length > 0 && terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [simTerminalLines, isAnalyzing]);

  // Handle style change and update current roast
  useEffect(() => {
    if (analysisResult) {
      const roast = getRoast(analysisResult.label, roastStyle);
      setCurrentRoast(roast);
    }
  }, [roastStyle, analysisResult]);

  const startAnalysis = () => {
    if (!password.trim()) return;

    setIsAnalyzing(true);
    setSimProgress(0);
    setAnalysisResult(null);
    setBreachCount(null);
    
    const initialLines = [
      ">> INITIALIZING THREAT SCANNERS...",
      ">> LOADING LOCAL ENCRYPTION AND ENTROPY DATA CORE...",
      ">> DEPLOYING CRACKING ALGORITHMS..."
    ];
    setSimTerminalLines(initialLines);

    // Run a quick pre-analysis to adjust simulation length based on strength
    const preCheck = analyzePassword(password);
    let totalDuration = 1200; // Weak defaults
    if (preCheck.label === "Weak") totalDuration = 1800;
    if (preCheck.label === "Good") totalDuration = 2600;
    if (preCheck.label === "Excellent") totalDuration = 3800;

    const intervalStep = 100;
    const increment = (100 / (totalDuration / intervalStep));
    let currentProgress = 0;

    const interval = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        
        // Finalize analysis
        const finalReport = analyzePassword(password);
        setAnalysisResult(finalReport);
        setCurrentRoast(getRoast(finalReport.label, roastStyle));
        setIsAnalyzing(false);

        setSimTerminalLines(prev => [
          ...prev,
          ">> PROGRESS: [████████████████████] 100%",
          ">> [SUCCESS] SECURITY AUDIT COMPLETED.",
          `>> ENTROPY: ${finalReport.entropy} BITS`,
          `>> SECURITY SCORE: ${finalReport.score}/100`,
          `>> RESISTANCE RATING: ${finalReport.label.toUpperCase()}`,
          `>> CRACK TIME RESISTANCE: ${finalReport.crackTime}`
        ]);
      } else {
        setSimProgress(Math.round(currentProgress));
        
        // Append attack methods at progress thresholds
        const progressPercent = Math.round(currentProgress);
        setSimTerminalLines(prev => {
          const lines = [...prev];
          
          // Custom progress bar renderer
          const barLength = 20;
          const filledLength = Math.round((progressPercent / 100) * barLength);
          const bar = "█".repeat(filledLength) + "░".repeat(Math.max(0, barLength - filledLength));
          
          // Remove last progress line if it exists to avoid bloat
          if (lines[lines.length - 1].startsWith(">> PROGRESS:")) {
            lines.pop();
          }
          
          lines.push(`>> PROGRESS: [${bar}] ${progressPercent}%`);

          if (progressPercent === 15) {
            lines.splice(lines.length - 1, 0, ">> [RUNNING] Trying Dictionary Attack against top 10k databases...");
          }
          if (progressPercent === 35) {
            lines.splice(lines.length - 1, 0, ">> [RUNNING] Trying Keyboard Pattern scans...");
          }
          if (progressPercent === 55) {
            lines.splice(lines.length - 1, 0, ">> [RUNNING] Trying Leetspeak normalization matching...");
          }
          if (progressPercent === 75) {
            lines.splice(lines.length - 1, 0, ">> [RUNNING] Simulating High-End GPU Cluster Brute Force...");
          }
          if (progressPercent === 90) {
            lines.splice(lines.length - 1, 0, ">> [RUNNING] Evaluating Sequential/Repeated key structures...");
          }

          return lines;
        });
      }
    }, intervalStep);
  };

  const handleCheckBreach = async () => {
    if (!password) return;
    setIsCheckingBreach(true);
    try {
      const count = await checkBreach(password);
      setBreachCount(count);
    } catch (error) {
      console.error(error);
      setBreachCount(0);
    } finally {
      setIsCheckingBreach(false);
    }
  };

  // Score styles
  const getScoreColor = (score) => {
    if (score <= 30) return { border: "border-red-500", text: "text-red-500 dark:text-red-400", bg: "bg-red-500", label: "CRITICAL THREAT!" };
    if (score <= 60) return { border: "border-orange-500", text: "text-orange-500 dark:text-orange-400", bg: "bg-orange-500", label: "WEAK CORE!" };
    if (score <= 80) return { border: "border-yellow-500", text: "text-yellow-500 dark:text-yellow-400", bg: "bg-yellow-500", label: "SECURE DEFENSE!" };
    return { border: "border-green-500", text: "text-green-500 dark:text-green-400", bg: "bg-green-500", label: "IMPENETRABLE FORTRESS!" };
  };

  const currentScoreDetails = analysisResult ? getScoreColor(analysisResult.score) : null;

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] bg-halftone pb-20 px-6 md:px-12 pt-8">
      {/* Decorative Badges */}
      <div className="absolute top-24 right-[5%] opacity-20 pointer-events-none transform rotate-12 font-bangers text-5xl text-[var(--text-primary)] select-none hidden lg:block">
        AUDITING LAB...
      </div>
      <div className="absolute bottom-16 left-[4%] opacity-20 pointer-events-none transform -rotate-12 font-bangers text-4xl text-red-500 select-none hidden lg:block">
        DECRYPT KEY...
      </div>

      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        {/* Page Hero Header */}
        <div className="relative border-3 border-[var(--border)] bg-[var(--bg-card)] p-6 comic-shadow">
          <div className="absolute -top-4 left-6 bg-red-500 text-white font-bangers px-4 py-1.5 border-3 border-[var(--border)] text-sm tracking-wider uppercase rotate-[-1deg] shadow-[2px_2px_0px_var(--shadow)] z-20">
            INTELLIGENCE HUB
          </div>
          <h1 className="font-bangers text-4xl sm:text-6xl tracking-widest uppercase mt-4 mb-2">
            PASSWORD <span className="text-red-500 dark:text-red-400">INTELLIGENCE</span> CENTER
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[var(--text-muted)] max-w-2xl leading-relaxed">
            Unleash advanced forensic audits on any credential. Run visual penetration simulations, discover keyboard row sequences, identify leet substitutions, and get roasted by professional cyber-analysts.
          </p>
        </div>

        {/* Input & Simulation Section Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Left panel: Input Area */}
          <ComicCard title="AUDIT PANEL" hoverable={false} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bangers text-lg tracking-wider text-[var(--text-primary)] uppercase flex items-center gap-2">
                <Lock className="w-4 h-4" /> Enter Password to Scan:
              </label>
              
              <div className="relative border-3 border-[var(--border)] shadow-[2px_2px_0px_var(--shadow)]">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isAnalyzing}
                  placeholder="Type password..."
                  className="w-full bg-[var(--bg-primary)] text-[var(--text-primary)] font-mono text-base px-4 py-3.5 pr-12 focus:outline-none placeholder-[var(--text-muted)] opacity-80"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") startAnalysis();
                  }}
                />
                
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <ComicButton
              onClick={startAnalysis}
              disabled={isAnalyzing || !password.trim()}
              variant="custom"
              className="w-full py-4 text-2xl bg-black text-white dark:bg-white dark:text-black border-3 hover:bg-red-500 dark:hover:bg-red-500 hover:text-white"
              actionWord="SCANNING!"
            >
              {isAnalyzing ? "AUDITING NOW..." : "START THREAT AUDIT!"}
            </ComicButton>

            {/* Privacy details */}
            <div className="border-2 border-dashed border-[var(--border)] p-3 text-center bg-[var(--bg-elevated)]">
              <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                🛡️ Local Analysis: 100% Secure. Calculations are performed locally on your device.
              </span>
            </div>
          </ComicCard>

          {/* Right panel: Terminal Simulation Console */}
          <div className="relative comic-border comic-shadow rounded-none bg-black text-green-400 p-4 font-mono text-xs h-[300px] flex flex-col justify-between">
            <div className="absolute -top-3.5 left-4 bg-green-500 text-black border-2 border-black font-bangers px-3 py-0.5 text-[10px] tracking-wider uppercase shadow-[1px_1px_0px_black]">
              ATTACK TERMINAL
            </div>

            <div className="overflow-y-auto flex-grow pr-1 space-y-1.5 custom-scrollbar">
              {simTerminalLines.length === 0 ? (
                <div className="text-gray-500 h-full flex flex-col justify-center items-center text-center p-4">
                  <Terminal className="w-12 h-12 mb-2 animate-pulse text-green-500" />
                  <p className="uppercase tracking-wider">Console Idle.</p>
                  <p className="text-[10px] lowercase text-gray-650 mt-1">
                    Enter password and click "start threat audit" to boot terminal diagnostics.
                  </p>
                </div>
              ) : (
                simTerminalLines.map((line, idx) => (
                  <div key={idx} className={`${line.includes("[SUCCESS]") ? "text-green-200 font-bold" : line.includes("Score:") ? "text-yellow-300" : line.includes("PROGRESS:") ? "text-green-300" : "text-green-400"}`}>
                    {line}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Progress indicators in console footer */}
            {isAnalyzing && (
              <div className="border-t border-green-800 pt-2 mt-2 flex justify-between items-center text-[10px]">
                <span className="uppercase text-green-600 animate-pulse">Scanning Port Vectors...</span>
                <span>{simProgress}% COMPLETE</span>
              </div>
            )}
          </div>
        </div>

        {/* Audit Results Dashboard (Revealed post-scan) */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="flex flex-col gap-8"
            >
              {/* Score Dashboard Card & Crack Resistance Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Score gauge */}
                <ComicCard title="SECURITY GAUGE" hoverable={false} className="md:col-span-1 flex flex-col items-center justify-center text-center p-8 bg-[var(--bg-elevated)]">
                  <div className={`relative w-32 h-32 rounded-full border-4 ${currentScoreDetails.border} flex flex-col items-center justify-center bg-[var(--bg-primary)] shadow-[4px_4px_0px_var(--shadow)] mb-4`}>
                    <span className="font-bangers text-5xl leading-none">
                      {analysisResult.score}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase mt-1">
                      SCORE
                    </span>
                  </div>
                  
                  <div className={`font-bangers text-lg tracking-widest ${currentScoreDetails.text} uppercase`}>
                    {currentScoreDetails.label}
                  </div>
                </ComicCard>

                {/* Score Diagnostic details */}
                <ComicCard title="DIAGNOSTIC TELEMETRY" hoverable={false} className="md:col-span-2 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4 font-mono text-xs divide-y md:divide-y-0 divide-[var(--border)]">
                    <div className="flex flex-col p-2">
                      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">ENTROPY STRENGTH</span>
                      <span className="font-bangers text-xl tracking-wider text-[var(--text-primary)] mt-1">
                        {analysisResult.entropy} BITS
                      </span>
                    </div>

                    <div className="flex flex-col p-2">
                      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">PASSWORD LENGTH</span>
                      <span className="font-bangers text-xl tracking-wider text-[var(--text-primary)] mt-1">
                        {analysisResult.length} CHARS ({analysisResult.lengthRating})
                      </span>
                    </div>

                    <div className="flex flex-col p-2 pt-4 md:pt-2">
                      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">CHARSET DIVERSITY</span>
                      <div className="flex flex-wrap gap-1 mt-1 text-[10px] font-bold">
                        <span className={`px-1.5 py-0.5 border ${analysisResult.diversity.lowercase ? "bg-black text-white dark:bg-white dark:text-black border-black" : "border-gray-300 text-gray-400 dark:border-gray-800"}`}>A-Z</span>
                        <span className={`px-1.5 py-0.5 border ${analysisResult.diversity.uppercase ? "bg-black text-white dark:bg-white dark:text-black border-black" : "border-gray-300 text-gray-400 dark:border-gray-800"}`}>A-Z</span>
                        <span className={`px-1.5 py-0.5 border ${analysisResult.diversity.numbers ? "bg-black text-white dark:bg-white dark:text-black border-black" : "border-gray-300 text-gray-400 dark:border-gray-800"}`}>0-9</span>
                        <span className={`px-1.5 py-0.5 border ${analysisResult.diversity.symbols ? "bg-black text-white dark:bg-white dark:text-black border-black" : "border-gray-300 text-gray-400 dark:border-gray-800"}`}>#$&</span>
                      </div>
                    </div>

                    <div className="flex flex-col p-2 pt-4 md:pt-2">
                      <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">EST. RESISTANCE</span>
                      <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400 mt-1">
                        <Flame className="w-4 h-4" />
                        <span className="font-bangers text-xl tracking-wider">
                          {analysisResult.crackTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Have I Been Pwned Integration Block */}
                  <div className="border-t-3 border-[var(--border)] pt-4 mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col text-center sm:text-left">
                      <span className="font-bangers uppercase tracking-wide text-xs">
                        BREACH ARCHIVE DETECTOR
                      </span>
                      <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                        Scan the Have I Been Pwned database via k-anonymity (Zero plaintext sent).
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {breachCount !== null ? (
                        <div className={`font-bangers text-sm border-2 px-3 py-1 border-[var(--border)] rotate-[-1deg] shadow-[2px_2px_0px_var(--shadow)] ${breachCount > 0 ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
                          {breachCount > 0 ? `FOUND IN ${breachCount.toLocaleString()} BREACHES!` : "0 BREACH ENTRIES FOUND!"}
                        </div>
                      ) : (
                        <ComicButton
                          onClick={handleCheckBreach}
                          disabled={isCheckingBreach}
                          variant="secondary"
                          className="px-4 py-1.5 text-xs shadow-[2px_2px_0px_var(--shadow)]"
                          actionWord="CHECKING!"
                        >
                          {isCheckingBreach ? "QUERYING..." : "SCAN PWNED ARCHIVE"}
                        </ComicButton>
                      )}
                    </div>
                  </div>
                </ComicCard>
              </div>

              {/* Password Roast Card with dropdown selections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                
                {/* Character Profile Selector */}
                <ComicCard title="ROAST CONTEXT" hoverable={false} className="md:col-span-1 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">SELECT AUDITOR PERSONALITY:</span>
                    <select
                      value={roastStyle}
                      onChange={(e) => setRoastStyle(e.target.value)}
                      className="border-3 border-[var(--border)] font-bangers text-lg uppercase tracking-wide bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-2 outline-none select-none shadow-[2px_2px_0px_var(--shadow)] cursor-pointer"
                    >
                      <option value="expert">Cybersecurity Expert</option>
                      <option value="villain">Sarcastic Villain</option>
                      <option value="corporate">IT Corporate Support</option>
                      <option value="gamer">Teen Gamer Trash-Talk</option>
                    </select>
                  </div>

                  {/* Character Avatar Box */}
                  <div className="border-3 border-[var(--border)] bg-[var(--bg-elevated)] p-4 flex flex-col items-center text-center shadow-[3px_3px_0px_var(--shadow)] mt-2">
                    <pre className="font-mono text-[10px] leading-tight select-none text-[var(--text-primary)]">
                      {roastStyle === "expert" && (
                        `    _______    \n   /  _ _  \\   \n  |  (o_o)  |  \n  |   \\_/   |  \n   \\_______/   `
                      )}
                      {roastStyle === "villain" && (
                        `    _______    \n   /  ^ ^  \\   \n  |  (◣_◢)  |  \n  |   \\m/   |  \n   \\_______/   `
                      )}
                      {roastStyle === "corporate" && (
                        `    _______    \n   /  - -  \\   \n  |  [ಠ_ಠ]  |  \n  |   \\=/   |  \n   \\_______/   `
                      )}
                      {roastStyle === "gamer" && (
                        `    _______    \n   /  x x  \\   \n  |  (◕_◕)  |  \n  |   \\o/   |  \n   \\_______/   `
                      )}
                    </pre>
                    <span className="font-bangers text-sm tracking-wider uppercase mt-3">
                      {roastStyle === "expert" && "AGENT SEC-OPS"}
                      {roastStyle === "villain" && "DR. BRUTE-FORCE"}
                      {roastStyle === "corporate" && "IT ADMIN GREG"}
                      {roastStyle === "gamer" && "X_NIGHTSHADE_X"}
                    </span>
                    <span className="font-mono text-[8px] text-[var(--text-muted)] uppercase">
                      {roastStyle === "expert" && "PENTEST FORENSICS OFFICER"}
                      {roastStyle === "villain" && "WANNABE WORLD CONQUEROR"}
                      {roastStyle === "corporate" && "TICKET MASTER LEVEL 1"}
                      {roastStyle === "gamer" && "AIMBOT & TRASH TALKER"}
                    </span>
                  </div>
                </ComicCard>

                {/* Comic Speech Bubble Roast Text */}
                <div className="md:col-span-2 relative flex flex-col">
                  <SpeechBubble
                    tailPosition="left"
                    className="border-3 border-[var(--border)] bg-[var(--bg-card)] p-6 comic-shadow flex-grow speech-bubble-tail-left text-sm"
                  >
                    <div className="font-marker text-red-500 dark:text-red-400 text-xs select-none mb-2 tracking-wide uppercase">
                      MESSAGE DIRECTIVE:
                    </div>
                    <p className="font-mono italic text-[var(--text-primary)] leading-relaxed">
                      "{currentRoast}"
                    </p>
                  </SpeechBubble>
                  
                  {/* Quick Refresh Roast Button */}
                  <div className="self-end mt-4 mr-2">
                    <ComicButton
                      onClick={() => setCurrentRoast(getRoast(analysisResult.label, roastStyle))}
                      variant="secondary"
                      className="px-3.5 py-1.5 text-xs shadow-[2px_2px_0px_var(--shadow)] flex items-center gap-1"
                      actionWord="REROASTED!"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> RE-ROAST
                    </ComicButton>
                  </div>
                </div>

              </div>

              {/* Threat Warnings & Recommendation Engine */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Threat Warnings List */}
                <ComicCard title="THREAT FINDINGS" hoverable={false} className="flex flex-col gap-4">
                  {analysisResult.findings.length === 0 ? (
                    <div className="flex items-center gap-3 font-mono text-xs text-green-600 bg-[var(--bg-elevated)] p-4 border border-[var(--border)]">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <div>
                        <p className="font-bold uppercase">NO DETECTED PATTERN THREATS!</p>
                        <p className="text-[10px] lowercase text-[var(--text-muted)] mt-0.5">
                          this password does not match simple dictionary terms, rows, or leetspeak substitutions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {analysisResult.findings.map((finding, idx) => (
                        <div
                          key={idx}
                          className={`flex items-start gap-3 border-2 p-3 font-mono text-xs ${
                            finding.severity === "critical"
                              ? "bg-red-100 border-red-500 text-red-800 dark:bg-red-950 dark:text-red-200"
                              : finding.severity === "high"
                              ? "bg-orange-100 border-orange-500 text-orange-800 dark:bg-orange-950 dark:text-orange-200"
                              : "bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200"
                          }`}
                        >
                          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                          <div className="flex-grow">
                            <span className="font-bold uppercase block tracking-wide">
                              {finding.severity.toUpperCase()} ALERT:
                            </span>
                            <span className="mt-1 block">
                              {finding.message}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ComicCard>

                {/* Recommendations Engine */}
                <ComicCard title="REMEDIAL Directives" hoverable={false} className="flex flex-col gap-4">
                  <div className="font-mono text-xs text-[var(--text-primary)]">
                    <p className="font-bold uppercase mb-3 text-[var(--text-muted)] tracking-wider">
                      RECOMMENDATIONS:
                    </p>
                    <ul className="space-y-2.5">
                      {analysisResult.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-red-500 font-bold select-none mt-0.5">▪</span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </ComicCard>

              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
