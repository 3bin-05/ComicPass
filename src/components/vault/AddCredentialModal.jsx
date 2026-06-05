import React, { useState, useEffect } from "react";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { encryptPassword } from "../../lib/encryption";
import { calculateEntropy, getStrengthLabel } from "../../lib/passwordUtils";
import { db } from "../../lib/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import ComicButton from "../ui/ComicButton";
import ComicCard from "../ui/ComicCard";

const CATEGORIES = ["Logins", "Social Media", "Finance", "Work", "Personal", "Other"];

export default function AddCredentialModal({
  isOpen,
  onClose,
  initialPassword = "",
  credentialToEdit = null, // If editing an existing credential
  onSaveSuccess
}) {
  const { user, derivedKey, vaultUnlocked, unlockVault, hasMasterPassword } = useAuthStore();
  const [platform, setPlatform] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("Logins");
  const [notes, setNotes] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Master password unlock states (if vault is locked when opening modal)
  const [masterPasswordInput, setMasterPasswordInput] = useState("");
  const [unlockError, setUnlockError] = useState("");
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Sync initial password or editing data
  useEffect(() => {
    if (isOpen) {
      if (credentialToEdit) {
        setPlatform(credentialToEdit.platform || "");
        setUsername(credentialToEdit.username || "");
        setEmail(credentialToEdit.email || "");
        setPassword(credentialToEdit.decryptedPassword || "");
        setCategory(credentialToEdit.category || "Logins");
        setNotes(credentialToEdit.notes || "");
        setIsFavorite(credentialToEdit.isFavorite || false);
      } else {
        setPlatform("");
        setUsername("");
        setEmail(user?.email || "");
        setPassword(initialPassword);
        setCategory("Logins");
        setNotes("");
        setIsFavorite(false);
      }
      setMasterPasswordInput("");
      setUnlockError("");
      setSaveError("");
    }
  }, [isOpen, initialPassword, credentialToEdit, user]);

  if (!isOpen) return null;

  const handleUnlockVault = async (e) => {
    e.preventDefault();
    if (!masterPasswordInput) {
      setUnlockError("ENTER MASTER PASSWORD, HERO!");
      return;
    }
    setUnlockError("");
    setUnlockLoading(true);
    try {
      await unlockVault(masterPasswordInput);
    } catch (err) {
      console.error(err);
      setUnlockError(err.message.toUpperCase());
    } finally {
      setUnlockLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!platform || !password) {
      setSaveError("PLATFORM AND PASSWORD ARE REQUIRED!");
      return;
    }
    if (!derivedKey) {
      setSaveError("VAULT IS LOCKED! DECRYPT FIRST!");
      return;
    }

    setSaveError("");
    setSaveLoading(true);

    try {
      // 1. Encrypt password client-side
      const { ciphertext, iv } = encryptPassword(password, derivedKey);
      
      // Calculate security rating of this password
      const entropy = calculateEntropy(password);
      const rating = getStrengthLabel(entropy);

      const credentialData = {
        platform,
        username,
        email,
        passwordCiphertext: ciphertext,
        passwordIV: iv,
        category,
        notes,
        isFavorite,
        securityRating: rating,
        updatedAt: new Date().toISOString(),
      };

      if (credentialToEdit) {
        // Update document
        const docRef = doc(db, "users", user.uid, "vault", credentialToEdit.id);
        await updateDoc(docRef, credentialData);
      } else {
        // Create new document
        credentialData.createdAt = new Date().toISOString();
        const colRef = collection(db, "users", user.uid, "vault");
        await addDoc(colRef, credentialData);
      }

      if (onSaveSuccess) onSaveSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setSaveError("FAILED TO SECURE DOCUMENT: " + err.message.toUpperCase());
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg my-8">
        
        {/* Case 1: Vault is Locked */}
        {!vaultUnlocked ? (
          <ComicCard title="SECURE ACCESS REQUIRED!" className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 border-2 border-[var(--border)] bg-[var(--bg-primary)] shadow-[1px_1px_0px_var(--shadow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center my-6">
              <div className="w-12 h-12 border-3 border-[var(--border)] bg-red-500 text-white flex items-center justify-center shadow-[3px_3px_0px_var(--shadow)] mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-bangers text-2xl uppercase tracking-wider mb-2">VAULT CURRENTLY ENCRYPTED</h3>
              <p className="text-sm font-mono text-[var(--text-muted)] max-w-xs">
                To encrypt and store credentials, you must derive your active session key.
              </p>
            </div>

            {unlockError && (
              <div className="mb-4 border-3 border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs p-3 font-bold uppercase tracking-wider animate-comic-shake">
                ⚠ {unlockError}
              </div>
            )}

            <form onSubmit={handleUnlockVault} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Enter Master Password:
                </label>
                <input
                  type="password"
                  required
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2.5 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] transition-all"
                  placeholder="Master Secret..."
                />
              </div>
              <ComicButton
                type="submit"
                disabled={unlockLoading}
                className="w-full py-3 mt-2"
                actionWord="DECRYPT!"
              >
                {unlockLoading ? "DERIVING KEY (100K ITERATIONS)..." : "DECRYPT VAULT CORE!"}
              </ComicButton>
            </form>
          </ComicCard>
        ) : (
          /* Case 2: Vault is Unlocked (Show Add/Edit Form) */
          <ComicCard title={credentialToEdit ? "EDIT ARCHIVE!" : "STORE SECRET!"} className="relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 border-2 border-[var(--border)] bg-[var(--bg-primary)] shadow-[1px_1px_0px_var(--shadow)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            >
              <X className="w-4 h-4" />
            </button>

            {saveError && (
              <div className="mb-4 border-3 border-red-500 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-mono text-xs p-3 font-bold uppercase tracking-wider animate-comic-shake">
                ⚠ ERROR: {saveError}
              </div>
            )}

            <form onSubmit={handleSave} className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Platform */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                    Platform / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)]"
                    placeholder="e.g. Google, Netflix"
                  />
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)]"
                  placeholder="superhero_handle"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Associated Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)]"
                  placeholder="superhero@passwordundo.com"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] pl-4 pr-12 py-2 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)]"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] outline-none"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bangers text-sm uppercase tracking-wider text-[var(--text-muted)]">
                  Notes / Instructions
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="border-3 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] px-4 py-2 font-mono text-sm outline-none shadow-[2px_2px_0px_var(--shadow)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_var(--shadow)] resize-none"
                  placeholder="Secure recovery codes, security questions..."
                />
              </div>

              {/* Favorite Toggle */}
              <label className="flex items-center gap-2 cursor-pointer mt-1 select-none w-max">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={(e) => setIsFavorite(e.target.checked)}
                  className="w-5 h-5 rounded-none border-2 border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] cursor-pointer accent-black dark:accent-white"
                />
                <span className="font-bangers text-sm uppercase tracking-wider text-[var(--text-primary)]">
                  Mark as Favorite Vault Item
                </span>
              </label>

              {/* Submit Button */}
              <ComicButton
                type="submit"
                disabled={saveLoading}
                className="w-full py-3 mt-3"
                actionWord="SECURE!"
              >
                {saveLoading ? "ENCRYPTING & UPLOADING..." : "SECURE IN VAULT!"}
              </ComicButton>
            </form>
          </ComicCard>
        )}
      </div>
    </div>
  );
}
