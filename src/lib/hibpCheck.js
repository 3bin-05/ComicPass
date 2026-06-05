import CryptoJS from "crypto-js";

/**
 * Checks Have I Been Pwned database for password breaches using k-anonymity.
 * Only the first 5 characters of the SHA-1 hash of the password are sent to the API.
 * 
 * @param {string} password The password to check.
 * @returns {Promise<number>} The number of times the password was breached, or 0 if safe/error.
 */
export async function checkBreach(password) {
  if (!password) return 0;
  
  try {
    // 1. Calculate SHA-1 hash of the password
    const hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
    
    // 2. Split into prefix (first 5 chars) and suffix (rest 35 chars)
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    
    // 3. Query the HIBP range API
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    if (!response.ok) {
      throw new Error(`HIBP API responded with status ${response.status}`);
    }
    
    // 4. Parse the text response
    const text = await response.text();
    const lines = text.split("\n");
    
    // 5. Look for matching suffix locally
    for (const line of lines) {
      const [lineSuffix, countStr] = line.split(":");
      if (lineSuffix.trim() === suffix) {
        return parseInt(countStr.trim(), 10);
      }
    }
    
    return 0;
  } catch (error) {
    console.error("Failed to check password breach:", error);
    return 0;
  }
}
