/**
 * Calculates the character pool size based on characters present in the password.
 */
export function getCharsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\~`]/.test(password)) size += 33;
  return size || 10; // Default to 10 if empty
}

/**
 * Calculates the entropy of a password in bits.
 */
export function calculateEntropy(password) {
  if (!password) return 0;
  const poolSize = getCharsetSize(password);
  return Math.round(password.length * Math.log2(poolSize));
}

/**
 * Categorizes the strength of a password based on entropy.
 */
export function getStrengthLabel(entropy) {
  if (entropy === 0) return "NONE";
  if (entropy < 40) return "WEAK";
  if (entropy < 60) return "FAIR";
  if (entropy < 80) return "STRONG";
  if (entropy < 100) return "EXCELLENT";
  return "MILITARY GRADE";
}

/**
 * Returns a score between 0 and 100 for visual progress bars.
 */
export function getStrengthScore(entropy) {
  // Map entropy (0 - 120+) to score (0 - 100)
  return Math.min(100, Math.round((entropy / 100) * 100));
}

/**
 * Computes a human-readable estimate of crack time using an offline GPU cracking array
 * performing 100 billion checks per second.
 */
export function getCrackTimeEstimate(password) {
  if (!password) return "Instant";
  const entropy = calculateEntropy(password);
  const attempts = Math.pow(2, entropy);
  const hashesPerSecond = 1e11; // 100 Billion attempts/sec (high-end GPU array)
  const seconds = attempts / hashesPerSecond;

  if (seconds < 1) return "Instant";
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.round(minutes)} minutes`;
  
  const hours = minutes / 60;
  if (hours < 24) return `${Math.round(hours)} hours`;
  
  const days = hours / 24;
  if (days < 365) return `${Math.round(days)} days`;
  
  const years = days / 365;
  if (years < 1000) return `${Math.round(years)} years`;
  if (years < 1e6) return `${Math.round(years / 1000)} thousand years`;
  if (years < 1e9) return `${Math.round(years / 1e6)} million years`;
  if (years < 1e12) return `${Math.round(years / 1e9)} billion years`;
  return "Centuries of Universe lifetimes";
}
