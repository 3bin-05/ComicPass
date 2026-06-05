import React, { useState, useEffect } from "react";
import { Lock, Unlock, Search, Plus, Trash2, Edit, Copy, Eye, EyeOff, Star, ShieldAlert } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { decryptPassword } from "../lib/encryption";
import { db } from "../lib/firebase";
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from "firebase/firestore";
import ComicCard from "../components/ui/ComicCard";
import ComicButton from "../components/ui/ComicButton";
import SpeechBubble from "../components/ui/SpeechBubble";
import AddCredentialModal from "../components/vault/AddCredentialModal";
import { useSEO } from "../lib/seo";

const CATEGORIES = ["All", "Logins", "Social Media", "Finance", "Work", "Personal", "Favorites"];

export default function Vault() {
  const { user, derivedKey, vaultUnlocked, hasMasterPassword, setupMasterPassword, unlockVault } = useAuthStore();

  useSEO({
    title: "Password Undo — Vault Core",
    description: "Securely manage, edit, and decrypt your password archives client-side using local AES-256 keys."
  });

  // Firestore credentials state
  const [credentials, setCredentials] = useState([]);
  const [decryptedPasswords, setDecryptedPasswords] = useState({}); // { credId: string }
  const [visiblePasswords, setVisiblePasswords] = useState({}); // { credId: boolean }

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCredential, setEditingCredential] = useState(null);

  // Form inputs for Master Password screens
  const [masterInput, setMasterInput] = useState("");
  const [confirmMasterInput, setConfirmMasterInput] = useState("");
  const [masterError, setMasterError] = useState("");
  const [masterLoading, setMasterLoading] = useState(false);

  // Delete confirmation modal states
  const [deletingId, setDeletingId] = useState(null);

  // Copy status text
  const [copiedId, setCopiedId] = useState(null);

  // 1. Fetch credentials on auth / key unlock
  useEffect(() => {
    if (!user || !vaultUnlocked || !derivedKey) {
      setCredentials([]);
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
  }, [user, vaultUnlocked, derivedKey]);

  // Handle setting up a new Master Password
  const handleSetupMaster = async (e) => {
    e.preventDefault();
    if (!masterInput || !confirmMasterInput) {
      setMasterError("FILL IN BOTH SECRET PORTALS!");
      return;
    }
    if (masterInput !== confirmMasterInput) {
      setMasterError("SECRETS DO NOT MATCH! SYNCHRONIZE KEYS!");
      return;
    }
    if (masterInput.length < 8) {
      setMasterError("MASTER KEY IS TOO FRAGILE! MINIMUM 8 CHARS!");
      return;
    }

    setMasterError("");
    setMasterLoading(true);
    try {
      await setupMasterPassword(masterInput);
    } catch (err) {
      console.error(err);
      setMasterError(err.message.toUpperCase());
    } finally {
      setMasterLoading(false);
    }
  };

  // Handle unlocking the vault
  const handleUnlock = async (e) => {
    e.preventDefault();
    if (!masterInput) {
      setMasterError("ENTER MASTER KEY!");
      return;
    }

    setMasterError("");
    setMasterLoading(true);
    try {
      await unlockVault(masterInput);
    } catch (err) {
      console.error(err);
      setMasterError(err.message.toUpperCase());
    } finally {
      setMasterLoading(false);
    }
  };

  // Toggle decrypt and reveal password on the fly
  const handleToggleDecrypt = (cred) => {
    const isVisible = visiblePasswords[cred.id];
    if (isVisible) {
      // Hide
      setVisiblePasswords(prev => ({ ...prev, [cred.id]: false }));
    } else {
      // Decrypt and show
      if (!derivedKey) return;
      const decrypted = decryptPassword(cred.passwordCiphertext, cred.passwordIV, derivedKey);
      setDecryptedPasswords(prev => ({ ...prev, [cred.id]: decrypted }));
      setVisiblePasswords(prev => ({ ...prev, [cred.id]: true }));
    }
  };

  // Handle password copy to clipboard
  const handleCopyPassword = (cred) => {
    if (!derivedKey) return;
    const decrypted = decryptPassword(cred.passwordCiphertext, cred.passwordIV, derivedKey);
    navigator.clipboard.writeText(decrypted);
    setCopiedId(cred.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Toggle favorite status on Firestore
  const handleToggleFavorite = async (cred) => {
    try {
      const docRef = doc(db, "users", user.uid, "vault", cred.id);
      await updateDoc(docRef, { isFavorite: !cred.isFavorite });
    } catch (error) {
      console.error("Failed to update favorite status:", error);
    }
  };

  // Trigger edit modal
  const handleEditClick = (cred) => {
    if (!derivedKey) return;
    const decrypted = decryptPassword(cred.passwordCiphertext, cred.passwordIV, derivedKey);
    setEditingCredential({
      ...cred,
      decryptedPassword: decrypted
    });
    setIsAddModalOpen(true);
  };

  // Handle delete document from Firestore
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      const docRef = doc(db, "users", user.uid, "vault", deletingId);
      await deleteDoc(docRef);
      setDeletingId(null);
    } catch (error) {
      console.error("Failed to delete credential:", error);
    }
  };

  // Filter criteria
  const filteredCredentials = credentials.filter((cred) => {
    const matchesSearch =
      (cred.platform && cred.platform.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cred.username && cred.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cred.email && cred.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cred.notes && cred.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === "All" ||
      (activeCategory === "Favorites" && cred.isFavorite) ||
      (cred.category && cred.category.toLowerCase() === activeCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  /* View 1: User has NO Master Password Set Up yet (New User Registration) */
  if (!hasMasterPassword && !masterLoading && vaultUnlocked === false) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] bg-halftone py-16 px-6 flex justify-center items-center">
        <div className="w-full max-w-lg">
          <ComicCard title="ESTABLISH VAULT CODES!" className="relative">
            <h2 className="font-bangers text-3xl tracking-widest text-center uppercase mb-6">
              CREATE MASTER KEY
            </h2>

            <SpeechBubble tailPosition="left" className="mb-6 border-red-500 shadow-[3px_3px_0px_var(--shadow)] text-sm">
              "WARNING, HERO: WE OPERATE A ZERO-KNOWLEDGE PROTOCOL. IF YOU LOSE THIS PASSWORD, ALL YOUR SECRETS ARE WIPED FOREVER!"
            </SpeechBubble>

            {masterError && (
              <div className="mb-6 border-3 border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs p-3 font-bold uppercase tracking-wider animate-comic-shake">
                ⚠ ERROR: {masterError}
              </div>
            )}

            <form onSubmit={handleSetupMaster} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={masterInput}
                  onChange={(e) => setMasterInput(e.target.value)}
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px]"
                  placeholder="Create ultra secret master password..."
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Confirm Master Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmMasterInput}
                  onChange={(e) => setConfirmMasterInput(e.target.value)}
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px]"
                  placeholder="Repeat master password..."
                />
              </div>

              <ComicButton
                type="submit"
                disabled={masterLoading}
                className="w-full py-3 text-xl mt-3"
                actionWord="SECURE!"
              >
                INITIALIZE VAULT CORES!
              </ComicButton>
            </form>
          </ComicCard>
        </div>
      </div>
    );
  }

  /* View 2: User has a Master Password, but the Vault is currently LOCKED */
  if (hasMasterPassword && !vaultUnlocked) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] bg-halftone py-16 px-6 flex justify-center items-center">
        <div className="w-full max-w-md">
          <ComicCard title="CORE LOCKED!" className="relative animate-float-slow">
            <h2 className="font-bangers text-3xl tracking-widest text-center uppercase mb-6">
              DECRYPT VAULT CORE
            </h2>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 border-3 border-[var(--border)] bg-red-500 text-white flex items-center justify-center shadow-[4px_4px_0px_var(--shadow)]">
                <Lock className="w-8 h-8" />
              </div>
            </div>

            {masterError && (
              <div className="mb-6 border-3 border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs p-3 font-bold uppercase tracking-wider animate-comic-shake">
                ⚠ {masterError}
              </div>
            )}

            <form onSubmit={handleUnlock} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Enter Master Password
                </label>
                <input
                  type="password"
                  required
                  value={masterInput}
                  onChange={(e) => setMasterInput(e.target.value)}
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px]"
                  placeholder="Master Secret..."
                />
              </div>

              <ComicButton
                type="submit"
                disabled={masterLoading}
                className="w-full py-3 text-xl mt-3"
                actionWord="DECRYPT!"
              >
                {masterLoading ? "DERIVING CORE KEY..." : "DECRYPT VAULT CORE!"}
              </ComicButton>
            </form>
          </ComicCard>
        </div>
      </div>
    );
  }

  /* View 3: Vault is Unlocked (Show Credentials Grid) */
  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] bg-halftone py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b-3 border-[var(--border)] pb-8">
          <div>
            <h1 className="font-bangers text-4xl sm:text-6xl tracking-widest uppercase mb-1 drop-shadow-[2px_2px_0px_var(--shadow)]">
              THE PASSWORD <span className="text-red-500 dark:text-red-400">VAULT</span>
            </h1>
            <p className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider">
              CLIENT-SIDE DECRYPTED DATA CORE — {credentials.length} BLOCKS ARCHIVED
            </p>
          </div>

          <ComicButton
            id="vault-new-btn"
            onClick={() => {
              setEditingCredential(null);
              setIsAddModalOpen(true);
            }}
            variant="danger"
            className="w-full md:w-auto py-3 shadow-[4px_4px_0px_var(--shadow)]"
            actionWord="NEW ARCHIVE!"
          >
            <Plus className="w-5 h-5 inline mr-1 stroke-[2.5]" />
            STORE SECRET DOCUMENT
          </ComicButton>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Search bar */}
          <div className="lg:col-span-4 relative">
            <input
              id="vault-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] pl-10 pr-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px]"
              placeholder="Search Platform/User/Notes..."
            />
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          </div>

          {/* Category Tabs */}
          <div className="lg:col-span-8 flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`font-bangers text-sm uppercase tracking-wide px-3.5 py-1.5 border-2 border-[var(--border)] transition-all shadow-[2px_2px_0px_var(--shadow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none
                  ${activeCategory === cat 
                    ? "bg-[var(--text-primary)] text-[var(--bg-primary)]" 
                    : "bg-[var(--bg-primary)] hover:bg-[var(--bg-elevated)]"}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Grid */}
        {filteredCredentials.length === 0 ? (
          <div className="text-center py-20 border-3 border-dashed border-[var(--border)] bg-[var(--bg-card)]">
            <p className="font-bangers text-2xl uppercase tracking-wider text-[var(--text-muted)]">
              NO SECRET RECORDS FOUND IN THE SECTOR!
            </p>
            <p className="font-mono text-xs text-[var(--text-muted)] mt-2 uppercase">
              REDEFINE YOUR FILTER QUERY OR FORGE NEW DOCUMENTS.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCredentials.map((cred) => {
              const isRevealed = visiblePasswords[cred.id];
              const displayPasswordVal = isRevealed ? decryptedPasswords[cred.id] : "••••••••";

              return (
                <ComicCard
                  key={cred.id}
                  title={cred.category || "SECRET"}
                  className="flex flex-col justify-between h-full min-h-[260px] relative"
                >
                  {/* Star Favorite icon in top right */}
                  <button
                    onClick={() => handleToggleFavorite(cred)}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-yellow-500 transition-colors z-25"
                  >
                    <Star
                      className={`w-5 h-5 stroke-[2.5]
                        ${cred.isFavorite ? "fill-yellow-500 text-yellow-500" : ""}`}
                    />
                  </button>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-bangers text-2xl tracking-wider uppercase pr-6 break-words">
                      {cred.platform}
                    </h3>

                    {/* Metadata items */}
                    <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[var(--text-muted)] border-t border-b border-[var(--border)] border-dashed py-3 my-1">
                      {cred.username && (
                        <div>
                          <span className="uppercase text-[9px] block">Username:</span>
                          <span className="font-bold text-[var(--text-primary)] text-xs truncate block">{cred.username}</span>
                        </div>
                      )}
                      {cred.email && (
                        <div>
                          <span className="uppercase text-[9px] block">Email:</span>
                          <span className="font-bold text-[var(--text-primary)] text-xs truncate block">{cred.email}</span>
                        </div>
                      )}
                      
                      {/* Live Password Decrypt Input */}
                      <div className="mt-2">
                        <span className="uppercase text-[9px] block mb-0.5">Encrypted Secret:</span>
                        <div className="relative flex items-center w-full">
                          <input
                            type="text"
                            readOnly
                            value={displayPasswordVal}
                            className="w-full border-2 border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-primary)] pl-3 pr-20 py-1.5 font-mono text-xs rounded-none outline-none"
                          />
                          <div className="absolute right-1.5 flex gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleDecrypt(cred)}
                              className="p-1 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] active:translate-x-[0.5px] active:translate-y-[0.5px] outline-none"
                              title={isRevealed ? "Hide Password" : "Decrypt & Show"}
                            >
                              {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyPassword(cred)}
                              className="p-1 border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] active:translate-x-[0.5px] active:translate-y-[0.5px] outline-none relative"
                              title="Copy decrypted password"
                            >
                              <Copy className="w-3 h-3" />
                              {copiedId === cred.id && (
                                <span className="absolute bottom-full mb-1 right-0 bg-red-500 text-white font-bangers text-[8px] px-1 py-0.5 uppercase tracking-wider select-none animate-bounce">
                                  COPIED!
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes preview */}
                    {cred.notes && (
                      <p className="text-xs font-mono text-[var(--text-muted)] italic line-clamp-2 mt-1 select-all break-words">
                        "{cred.notes}"
                      </p>
                    )}
                  </div>

                  {/* Panel footer operations */}
                  <div className="flex gap-2 justify-end mt-6 border-t border-[var(--border)] pt-4">
                    <button
                      onClick={() => handleEditClick(cred)}
                      className="p-1.5 border-2 border-[var(--border)] bg-[var(--bg-primary)] shadow-[2px_2px_0px_var(--shadow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center"
                      title="Edit secret block"
                    >
                      <Edit className="w-4 h-4 stroke-[2.5]" />
                    </button>
                    
                    <button
                      onClick={() => setDeletingId(cred.id)}
                      className="p-1.5 border-2 border-[var(--border)] bg-red-500 text-white shadow-[2px_2px_0px_var(--shadow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center hover:bg-black dark:hover:bg-white dark:hover:text-black"
                      title="Delete secret block"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </div>
                </ComicCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <ComicCard title="CRITICAL PROMPT!" className="text-center p-6">
              <h3 className="font-bangers text-2xl uppercase tracking-wider mb-2">ARE YOU SURE, HERO?</h3>
              <p className="text-sm font-mono text-[var(--text-muted)] mb-6 uppercase">
                THIS WILL ERASE THE SECURED PASSPHRASE FROM THE DATABLOCKS FOREVER!
              </p>
              
              <div className="flex gap-4 justify-center">
                <ComicButton
                  onClick={handleDeleteConfirm}
                  variant="danger"
                  className="px-6 py-2.5 text-lg"
                  actionWord="ERASED!"
                >
                  YES, DELETE IT!
                </ComicButton>
                
                <ComicButton
                  onClick={() => setDeletingId(null)}
                  variant="secondary"
                  className="px-6 py-2.5 text-lg"
                  actionWord="ABORT!"
                >
                  NO, KEEP IT!
                </ComicButton>
              </div>
            </ComicCard>
          </div>
        </div>
      )}

      {/* Add / Edit Credential Modal */}
      <AddCredentialModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCredential(null);
        }}
        credentialToEdit={editingCredential}
        onSaveSuccess={() => {
          setEditingCredential(null);
        }}
      />
    </div>
  );
}
