# ⚡ Password Undo — Impenetrable Password Vault

> **"Generate. Encrypt. Store. Protect."**
> A zero-knowledge client-side encrypted password manager built with a monochrome comic-book aesthetic.

---

## 📌 Project Overview

Password Undo is a full-stack password generator, vault, and security audit dashboard. The entire application is built around the principle of **zero-knowledge privacy**—your master password and plaintext keys never leave your browser under any circumstance. 

All of this security is wrapped in a high-fidelity monochrome comic-book style design featuring heavy borders, hard-offset box shadows, spring-physics micro-interactions, and retro action-word popups (*POW!*, *BAM!*, *ZAP!*).

---

## 🎨 High-Fidelity UX/UI Design System

- **Dual-Tone Monochrome**: Uses HSL-tailored pure black and white palettes that swap seamlessly between Dark and Light mode.
- **Dynamic Comic Panels**: Content boxes carrying `3px` solid borders with a hard `6px` flat offset shadow that shifts dynamically to `9px` on hover.
- **滿足 micro-animations**: Custom buttons that physically "slam down" 4px on click and pop floating comic overlays (*CLICK!*, *SAVED!*, *COPIED!*) utilizing custom Framer Motion spring physics.
- **Comic Typography**:
  - `Bangers` (Google Fonts) — For display headers, action words, and tags.
  - `Space Mono` — For password readouts, entropy bits, and crack times.
  - `Permanent Marker` — For speech bubbles and warning banners.
- **Theatrical Loading Screen**: A splash sequence showing a fake input field filling character-by-character with red asterisks accompanied by cycling security status reports, culminating in a staggered letter reveal of `ACCESS GRANTED`.

---

## 🔒 Security & Cryptographic Architecture

### 1. Client-Side Key Derivation (PBKDF2)
When logging in or unlocking your vault, your **Master Password** is combined with a random 128-bit per-user salt and fed into PBKDF2:
- **Hash function**: SHA-256 HMAC
- **Iterations**: 100,000 rounds
- **Derived key**: 256-bit symmetric key
This key exists exclusively in React memory state (`zustand` store) for the duration of your authenticated session. It is wiped on logout and is **never** written to local storage, cookies, or Firestore.

### 2. Client-Side Symmetric Encryption (AES-CBC)
When saving a password to the database:
- A fresh 16-byte random Initialization Vector (IV) is generated for every single encrypt operation.
- The password plaintext is encrypted using **AES-256-CBC** with the derived key.
- The ciphertext (Base64) and the IV (Hex) are stored together in Firestore. Reusing keys with unique IVs prevents ciphertext pattern analysis.

### 3. Password Verification (Zero-Knowledge)
To check if the entered master password is correct without storing it, Password Undo generates an encrypted verifier string `"Password Undo Access Granted"` (with fallback support for "ComicPass Access Granted") using the derived key upon master password setup. 
On subsequent unlocks, the app derives the key from the entered password, attempts to decrypt this verifier, and checks if it matches.

### 4. Have I Been Pwned checks (k-Anonymity)
When checking if a password is leaked:
1. The password is hashed using SHA-1 locally.
2. Only the first **5 hex characters** of the hash are sent to the HIBP API.
3. The API returns a list of matching suffix hashes and leak counts.
4. Password Undo checks the returned list locally for the remaining 35 characters. Your plaintext password or full hash never leaves the device.

---

## 🗂 Folder Structure

```
password-undo/
├── firebase.json             # Firebase configuration
├── firestore.rules           # Security rules for Firestore
├── index.html                # Entry HTML template (optimized SEO tags)
├── tailwind.config.js        # Tailwind v3 custom configurations
├── package.json              # Project dependencies
├── LICENSE                   # License details
└── src/
    ├── App.jsx               # Application shell, router, and auth listeners
    ├── main.jsx              # React mounting core
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx    # Comic navbar & theme day/night toggles
    │   │   └── Footer.jsx    # Styled footer with disclaimers
    │   ├── ui/
    │   │   ├── ComicButton.jsx   # Slamming spring button with floating overlay particles
    │   │   ├── ComicCard.jsx     # Comic card container panel
    │   │   ├── SpeechBubble.jsx  # Permanent marker quote bubble
    │   │   ├── StrengthMeter.jsx # Partitioned live strength meter
    │   │   └── ThemeToggle.jsx   # Flash transition day/night toggler
    │   └── vault/
    │       └── AddCredentialModal.jsx  # Decrypt gates and upload inputs
    ├── lib/
    │   ├── encryption.js     # PBKDF2 & AES-256 cryptographic helpers
    │   ├── firebase.js       # Firebase initialization & configurations
    │   ├── hibpCheck.js      # Anonymous k-anonymity leak scans
    │   ├── passwordUtils.js  # Shannon entropy & cracking speed math
    │   └── seo.js            # Dynamic SEO title and meta hooks
    ├── store/
    │   └── authStore.js      # Zustand global memory state manager
    ├── pages/
    │   ├── Loading.jsx       # Theatrical asterisk cycling screen
    │   ├── Home.jsx          # Vector speedline landing page
    │   ├── Login.jsx         # Sign in portal
    │   ├── Register.jsx      # New enlistment portal
    │   ├── Generator.jsx     # Scramble loops & length parameters
    │   ├── Vault.jsx         # On-the-fly decryption grids
    │   └── Dashboard.jsx     # Security metrics audits
    └── styles/
        └── index.css         # Halftone patterns, scrollbars, and keyframe animations
```

---

## 🛠 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A Firebase Project (with Firestore and Email/Password + Google Auth enabled)

### Step 1: Clone and Install
```bash
git clone https://github.com/yourusername/password-undo.git
cd password-undo
npm install
```

### Step 2: Configure Environment Variables
Duplicate `.env.example` as `.env` and enter your Firebase SDK configurations:
```bash
cp .env.example .env
```
Open `.env` and fill in:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Step 3: Start Dev Server
```bash
npm run dev
```

### Step 4: Build for Production
To bundle and optimize the app for production:
```bash
npm run build
```

---

## 🔥 Firestore Security Rules

To enforce database-level access control, apply the following rule set in your Firebase Console. It restricts document access exclusively to the authenticated user owning the matching UID scope:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profile document: holds salt, verifier, and verifierIV
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // User's vault items collection: holds the encrypted password credentials
      match /vault/{credId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
