import CryptoJS from "crypto-js";

/**
 * Generate a random 128-bit (16-byte) salt as a Hex string.
 */
export function generateSalt() {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

/**
 * Derive a 256-bit key from a master password and salt using PBKDF2 (100,000 iterations, SHA-256).
 * Returns the key as a Hex string.
 */
export function deriveKey(masterPassword, saltHex) {
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  const key = CryptoJS.PBKDF2(masterPassword, salt, {
    keySize: 256 / 32, // 8 words = 256 bits
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256
  });
  return key.toString(CryptoJS.enc.Hex);
}

/**
 * Encrypt plaintext using AES-256-CBC with a random 16-byte IV.
 * Returns { ciphertext: base64, iv: hex }.
 */
export function encryptPassword(plaintext, derivedKeyHex) {
  const key = CryptoJS.enc.Hex.parse(derivedKeyHex);
  const iv = CryptoJS.lib.WordArray.random(16);
  const encrypted = CryptoJS.AES.encrypt(plaintext, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return {
    ciphertext: encrypted.toString(), // Base64 string
    iv: iv.toString(CryptoJS.enc.Hex) // Hex string
  };
}

/**
 * Decrypt ciphertext using AES-256-CBC with the provided IV.
 * Returns the plaintext string.
 */
export function decryptPassword(ciphertext, ivHex, derivedKeyHex) {
  try {
    const key = CryptoJS.enc.Hex.parse(derivedKeyHex);
    const iv = CryptoJS.enc.Hex.parse(ivHex);
    const decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed:", error);
    return "";
  }
}

/**
 * Generates verification data for a new Master Password.
 * Encrypts a known verification phrase with the derived key.
 */
export const VERIFICATION_PHRASE = "Password Undo Access Granted";

export function generateVerifier(derivedKeyHex) {
  return encryptPassword(VERIFICATION_PHRASE, derivedKeyHex);
}

/**
 * Verifies if the derived key is correct by attempting to decrypt the verifier ciphertext.
 */
export function verifyMasterPassword(verifierCiphertext, verifierIvHex, derivedKeyHex) {
  const decrypted = decryptPassword(verifierCiphertext, verifierIvHex, derivedKeyHex);
  return decrypted === VERIFICATION_PHRASE || decrypted === "ComicPass Access Granted";
}
