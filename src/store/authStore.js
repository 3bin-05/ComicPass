import { create } from "zustand";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { deriveKey, verifyMasterPassword, generateSalt, generateVerifier } from "../lib/encryption";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  derivedKey: null,
  salt: null,
  vaultUnlocked: false,
  hasMasterPassword: false,
  verifierData: null, // Stores { verifier, verifierIV }
  theme: localStorage.getItem("comic-theme") || "dark",

  initializeTheme: () => {
    const currentTheme = get().theme;
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },

  setTheme: (newTheme) => {
    localStorage.setItem("comic-theme", newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    set({ theme: newTheme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    get().setTheme(nextTheme);
  },

  setUser: async (user) => {
    if (!user) {
      set({
        user: null,
        loading: false,
        derivedKey: null,
        salt: null,
        vaultUnlocked: false,
        hasMasterPassword: false,
        verifierData: null,
      });
      return;
    }

    set({ user, loading: true });

    try {
      // Load user profile from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.salt && data.verifier && data.verifierIV) {
          set({
            salt: data.salt,
            hasMasterPassword: true,
            verifierData: {
              verifier: data.verifier,
              verifierIV: data.verifierIV,
            },
            loading: false,
          });
        } else {
          set({
            salt: null,
            hasMasterPassword: false,
            verifierData: null,
            loading: false,
          });
        }
      } else {
        // No profile document yet
        set({
          salt: null,
          hasMasterPassword: false,
          verifierData: null,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      set({ loading: false });
    }
  },

  setupMasterPassword: async (masterPassword) => {
    const { user } = get();
    if (!user) throw new Error("No authenticated user");

    const salt = generateSalt();
    // 100k iterations PBKDF2
    const key = deriveKey(masterPassword, salt);
    // Generate verifier credentials
    const verifierObj = generateVerifier(key);

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      salt,
      verifier: verifierObj.ciphertext,
      verifierIV: verifierObj.iv,
      createdAt: new Date().toISOString(),
    });

    set({
      derivedKey: key,
      salt,
      hasMasterPassword: true,
      vaultUnlocked: true,
      verifierData: {
        verifier: verifierObj.ciphertext,
        verifierIV: verifierObj.iv,
      },
    });
  },

  unlockVault: async (masterPassword) => {
    const { salt, verifierData } = get();
    if (!salt || !verifierData) {
      throw new Error("User salt or verifier data not found. Setup master password first.");
    }

    // Derive key
    const key = deriveKey(masterPassword, salt);
    
    // Verify key
    const isValid = verifyMasterPassword(
      verifierData.verifier,
      verifierData.verifierIV,
      key
    );

    if (!isValid) {
      throw new Error("POW! Invalid Master Password! Access Denied!");
    }

    set({
      derivedKey: key,
      vaultUnlocked: true,
    });
  },

  lockVault: () => {
    set({
      derivedKey: null,
      vaultUnlocked: false,
    });
  },

  logout: async () => {
    await auth.signOut();
    set({
      user: null,
      derivedKey: null,
      salt: null,
      vaultUnlocked: false,
      hasMasterPassword: false,
      verifierData: null,
    });
  },
}));
