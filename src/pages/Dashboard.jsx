import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ShieldAlert, Zap, AlertTriangle, KeyRound, Award, CheckCircle } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { decryptPassword } from "../lib/encryption";
import { calculateEntropy, getStrengthLabel } from "../lib/passwordUtils";
import { checkBreach } from "../lib/hibpCheck";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import SpeechBubble from "../components/ui/SpeechBubble";
import { useSEO } from "../lib/seo";

export default function Dashboard() {
  const { user, derivedKey, vaultUnlocked } = useAuthStore();
  const navigate = useNavigate();

  useSEO({
    title: "ComicPass — Security Audit",
    description: "Audit your password vault health score, flag duplicates, and check for HIBP credentials breaches."
  });

  // Credentials
  const [credentials, setCredentials] = useState([]);
  const [analyzedData, setAnalyzedData] = useState({
    total: 0,
    strong: 0,
    fair: 0,
    weak: 0,
    duplicates: 0,
    duplicateGroups: {}, // password -> [platforms]
    breached: 0,
    breachDetails: {}, // credId -> breachCount
    healthScore: 100,
    isAudited: false,
  });

  // Audit states
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditProgress, setAuditProgress] = useState(0);

  // Fetch vault items
  useEffect(() => {
    if (!user || !vaultUnlocked) {
      navigate("/vault");
      return;
    }

    const q = query(collection(db, "users", user.uid, "vault"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setCredentials(list);
    }, (error) => {
      console.error("Error loading credentials:", error);
    });

    return () => unsubscribe();
  }, [user, vaultUnlocked, navigate]);

  // Compute local stats (Strength, Duplicates)
  useEffect(() => {
    if (credentials.length === 0 || !derivedKey) {
      setAnalyzedData({
        total: 0,
        strong: 0,
        fair: 0,
        weak: 0,
        duplicates: 0,
        duplicateGroups: {},
        breached: 0,
        breachDetails: {},
        healthScore: 100,
        isAudited: false,
      });
      return;
    }

    let strong = 0;
    let fair = 0;
    let weak = 0;
    const passwordMap = {}; // decryptedPassword -> list of credential items

    // Decrypt all passwords in memory to evaluate strength & duplicates
    credentials.forEach((cred) => {
      const decrypted = decryptPassword(cred.passwordCiphertext, cred.passwordIV, derivedKey);
      const entropy = calculateEntropy(decrypted);
      const rating = getStrengthLabel(entropy);

      if (rating === "STRONG" || rating === "EXCELLENT" || rating === "MILITARY GRADE") {
        strong++;
      } else if (rating === "FAIR") {
        fair++;
      } else {
        weak++;
      }

      if (decrypted) {
        if (!passwordMap[decrypted]) {
          passwordMap[decrypted] = [];
        }
        passwordMap[decrypted].push(cred);
      }
    });

    // Detect duplicates
    let duplicatesCount = 0;
    const duplicateGroups = {};

    Object.keys(passwordMap).forEach((pass) => {
      if (passwordMap[pass].length > 1) {
        duplicatesCount += passwordMap[pass].length;
        duplicateGroups[pass] = passwordMap[pass].map(c => c.platform);
      }
    });

    // Health Score calculation (assuming no breaches unless audited)
    const total = credentials.length;
    const uniqueCount = total - duplicatesCount;
    const breachFreeCount = total - (analyzedData.breached || 0);

    const strongWeight = (strong / total) * 50;
    const uniqueWeight = (uniqueCount / total) * 30;
    const breachFreeWeight = (breachFreeCount / total) * 20;
    const score = Math.round(strongWeight + uniqueWeight + breachFreeWeight);

    setAnalyzedData((prev) => ({
      ...prev,
      total,
      strong,
      fair,
      weak,
      duplicates: duplicatesCount,
      duplicateGroups,
      healthScore: Math.max(0, Math.min(100, score)),
    }));
  }, [credentials, derivedKey]);

  // Run HIBP Breach check for all passwords sequentially
  const runBreachAudit = async () => {
    if (credentials.length === 0 || !derivedKey || isAuditing) return;
    setIsAuditing(true);
    setAuditProgress(0);
    
    let breachCount = 0;
    const breachDetails = {};

    for (let i = 0; i < credentials.length; i++) {
      const cred = credentials[i];
      const decrypted = decryptPassword(cred.passwordCiphertext, cred.passwordIV, derivedKey);
      
      try {
        const count = await checkBreach(decrypted);
        if (count > 0) {
          breachCount++;
          breachDetails[cred.id] = count;
        }
      } catch (err) {
        console.error(`Failed HIBP check for ${cred.platform}:`, err);
      }
      
      // Update progress
      setAuditProgress(Math.round(((i + 1) / credentials.length) * 100));
      
      // Artificial delay to prevent HIBP rate limit blocks
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Recalculate health with breaches
    const total = credentials.length;
    const uniqueCount = total - analyzedData.duplicates;
    const breachFreeCount = total - breachCount;

    const strongWeight = (analyzedData.strong / total) * 50;
    const uniqueWeight = (uniqueCount / total) * 30;
    const breachFreeWeight = (breachFreeCount / total) * 20;
    const score = Math.round(strongWeight + uniqueWeight + breachFreeWeight);

    setAnalyzedData((prev) => ({
      ...prev,
      breached: breachCount,
      breachDetails,
      healthScore: Math.max(0, Math.min(100, score)),
      isAudited: true,
    }));
    
    setIsAuditing(false);
  };

  const getScoreColor = () => {
    const score = analyzedData.healthScore;
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-orange-500";
    if (score < 90) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getScoreBadge = () => {
    const score = analyzedData.healthScore;
    if (score < 40) return "CRITICAL STATE!";
    if (score < 70) return "VULNERABLE SECTOR!";
    if (score < 90) return "GOOD DEFENSE!";
    return "IMPERVIOUS VAULT!";
  };

  if (credentials.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] bg-halftone py-16 px-6 flex flex-col justify-center items-center">
        <SpeechBubble tailPosition="right" className="mb-6 max-w-sm">
          "HEY HERO, YOU CAN'T RUN AN AUDIT ON AN EMPTY VAULT! STORE SOME SECRETS FIRST!"
        </SpeechBubble>
        <ComicButton
          id="dashboard-vault-btn"
          onClick={() => navigate("/vault")}
          variant="danger"
          className="shadow-[4px_4px_0px_var(--shadow)]"
        >
          GO TO VAULT!
        </ComicButton>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] bg-halftone py-12 px-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-8">
        
        {/* Title */}
        <div className="text-center">
          <h1 className="font-bangers text-4xl sm:text-6xl tracking-widest uppercase mb-2 drop-shadow-[2px_2px_0px_var(--shadow)]">
            SECURITY <span className="text-red-500 dark:text-red-400">AUDIT CENTER</span>
          </h1>
          <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
            REAL-TIME SECURITY RATINGS AND THREAT ANALYSIS
          </p>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Health Score Card */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-6">
            <ComicCard title="HEALTH RATING" className="w-full text-center">
              <div className="my-6">
                <span className="font-bangers text-7xl md:text-9xl text-[var(--text-primary)] drop-shadow-[4px_4px_0px_var(--shadow)]">
                  {analyzedData.healthScore}%
                </span>
                <div className="font-bangers text-lg text-red-500 dark:text-red-400 tracking-widest mt-2">
                  {getScoreBadge()}
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-6 w-full border-3 border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden shadow-[2px_2px_0px_var(--shadow)] mb-4">
                <div 
                  className={`h-full transition-all duration-500 ${getScoreColor()}`}
                  style={{ width: `${analyzedData.healthScore}%` }}
                />
              </div>

              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase leading-relaxed text-left">
                HEALTH SCORE IS CALCULATED BASED ON PASSWORD STRENGTH (50%), DUPLICATIONS (30%), AND ANONYMOUS HIBP BREACH RECORDS (20%).
              </p>
            </ComicCard>

            {/* Audit Status Button Panel */}
            <ComicCard title="BREACH SCANNER" className="w-full flex flex-col gap-4">
              <p className="font-mono text-xs text-[var(--text-muted)] uppercase leading-relaxed">
                Scan all stored passwords against 10+ billion public breach logs using the k-anonymity API model.
              </p>

              {isAuditing && (
                <div className="w-full flex flex-col gap-2">
                  <div className="flex justify-between font-bangers text-sm text-[var(--text-primary)] uppercase">
                    <span>SCANNING SECTOR...</span>
                    <span>{auditProgress}%</span>
                  </div>
                  <div className="h-4 w-full border-2 border-[var(--border)] bg-[var(--bg-elevated)] overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: `${auditProgress}%` }} />
                  </div>
                </div>
              )}

              {!analyzedData.isAudited && !isAuditing ? (
                <ComicButton
                  id="dashboard-audit-btn"
                  onClick={runBreachAudit}
                  variant="danger"
                  className="w-full py-3 shadow-[4px_4px_0px_var(--shadow)]"
                  actionWord="AUDIT!"
                >
                  RUN LIVE BREACH AUDIT!
                </ComicButton>
              ) : (
                !isAuditing && (
                  <div className="flex flex-col gap-3">
                    <div className="border-2 border-[var(--border)] bg-[var(--bg-elevated)] p-3 font-mono text-[11px] text-center uppercase">
                      Last scan completed. {analyzedData.breached} threats flagged.
                    </div>
                    <ComicButton
                      id="dashboard-reaudit-btn"
                      onClick={runBreachAudit}
                      variant="secondary"
                      className="w-full py-2"
                      actionWord="RE-AUDIT!"
                    >
                      RE-RUN LIVE AUDIT!
                    </ComicButton>
                  </div>
                )
              )}
            </ComicCard>
          </div>

          {/* Detailed Statistics Panels */}
          <div className="col-span-1 md:col-span-7 flex flex-col gap-6">
            
            {/* Strength Analysis Card */}
            <ComicCard title="STRENGTH MATRIX" className="w-full">
              <div className="grid grid-cols-3 gap-4 text-center my-2">
                <div className="border-3 border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[2px_2px_0px_var(--shadow)]">
                  <div className="font-bangers text-3xl text-green-500">{analyzedData.strong}</div>
                  <div className="font-bangers text-xs tracking-wider text-[var(--text-muted)] uppercase">STRONG CORES</div>
                </div>
                <div className="border-3 border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[2px_2px_0px_var(--shadow)]">
                  <div className="font-bangers text-3xl text-yellow-500">{analyzedData.fair}</div>
                  <div className="font-bangers text-xs tracking-wider text-[var(--text-muted)] uppercase">FAIR CORES</div>
                </div>
                <div className="border-3 border-[var(--border)] bg-[var(--bg-elevated)] p-4 shadow-[2px_2px_0px_var(--shadow)]">
                  <div className="font-bangers text-3xl text-red-500">{analyzedData.weak}</div>
                  <div className="font-bangers text-xs tracking-wider text-[var(--text-muted)] uppercase">WEAK CORES</div>
                </div>
              </div>
            </ComicCard>

            {/* Warnings list (Duplicates & Breaches) */}
            <ComicCard title="THREAT REPORT" className="w-full flex-grow">
              
              {/* No threats state */}
              {analyzedData.duplicates === 0 && (!analyzedData.isAudited || analyzedData.breached === 0) && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 stroke-[2.5] mb-3" />
                  <p className="font-bangers text-2xl uppercase tracking-wider text-green-500">
                    ALL SECTORS IMPERVIOUS!
                  </p>
                  <p className="font-mono text-xs text-[var(--text-muted)] mt-1 uppercase">
                    No duplicate passwords detected. {!analyzedData.isAudited ? "Run breach scan to audit leaks." : "Zero credentials flagged in leaks."}
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-4 font-mono text-xs select-text">
                
                {/* 1. Duplicate Passwords Warning */}
                {analyzedData.duplicates > 0 && (
                  <div className="border-3 border-yellow-500 bg-yellow-50 dark:bg-yellow-950 p-4 shadow-[2px_2px_0px_rgba(234,179,8,1)] flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-bangers text-yellow-600 dark:text-yellow-400 text-lg uppercase tracking-wider">
                      <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                      Duplicate Password Reuses! ({analyzedData.duplicates} Items)
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] uppercase leading-relaxed mb-1">
                      reusing passwords across platforms compromises all associated accounts if one is breached.
                    </p>
                    <ul className="list-disc pl-5 flex flex-col gap-1 text-[11px] text-[var(--text-primary)]">
                      {Object.keys(analyzedData.duplicateGroups).map((pass, i) => (
                        <li key={i}>
                          Identical key shared on: <span className="font-bold">{analyzedData.duplicateGroups[pass].join(", ")}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2. Breached Passwords Warning */}
                {analyzedData.isAudited && analyzedData.breached > 0 && (
                  <div className="border-3 border-red-500 bg-red-50 dark:bg-red-950 p-4 shadow-[2px_2px_0px_rgba(239,68,68,1)] flex flex-col gap-2 animate-comic-shake">
                    <div className="flex items-center gap-2 font-bangers text-red-600 dark:text-red-400 text-lg uppercase tracking-wider">
                      <ShieldAlert className="w-5 h-5 stroke-[2.5]" />
                      Breached Credentials Detected! ({analyzedData.breached} Items)
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] uppercase leading-relaxed mb-1">
                      the following credentials match known breaches. replace them immediately!
                    </p>
                    <ul className="list-disc pl-5 flex flex-col gap-1 text-[11px] text-[var(--text-primary)]">
                      {credentials.map((cred) => {
                        const breachCountVal = analyzedData.breachDetails[cred.id];
                        if (breachCountVal > 0) {
                          return (
                            <li key={cred.id}>
                              <span className="font-bold">{cred.platform}</span> ({cred.username || cred.email}) — Found in <span className="font-bold text-red-500">{breachCountVal.toLocaleString()}</span> known breaches!
                            </li>
                          );
                        }
                        return null;
                      })}
                    </ul>
                  </div>
                )}

              </div>
            </ComicCard>
          </div>

        </div>
      </div>
    </div>
  );
}
