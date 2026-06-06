import { COMMON_PASSWORDS, DICTIONARY_WORDS, KEYBOARD_PATTERNS, LEET_MAP } from "./commonPasswords";

/**
 * Calculates the character set size based on characters present in the password.
 */
function getCharsetSize(password) {
  let size = 0;
  if (/[a-z]/.test(password)) size += 26;
  if (/[A-Z]/.test(password)) size += 26;
  if (/[0-9]/.test(password)) size += 10;
  if (/[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\~`]/.test(password)) size += 33;
  return size || 10; // Default to 10 if empty
}

/**
 * Normalizes a leetspeak password to plain lowercase English
 */
function normalizeLeet(password) {
  let normalized = password.toLowerCase();
  for (const [leet, plain] of Object.entries(LEET_MAP)) {
    // Escape special regex chars
    const escaped = leet.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    normalized = normalized.replace(new RegExp(escaped, 'g'), plain);
  }
  return normalized;
}

/**
 * Analyzes a password and returns a detailed security assessment report.
 */
export function analyzePassword(password) {
  if (!password) {
    return {
      score: 0,
      label: "EMPTY",
      entropy: 0,
      length: 0,
      lengthRating: "Weak",
      charsetSize: 0,
      diversity: { lowercase: false, uppercase: false, numbers: false, symbols: false },
      findings: [],
      recommendations: ["Enter a password to start the security audit."]
    };
  }

  const length = password.length;
  const lowercase = /[a-z]/.test(password);
  const uppercase = /[A-Z]/.test(password);
  const numbers = /[0-9]/.test(password);
  const symbols = /[!@#$%^&*()_+\-=\[\]{};':",./<>?|\\~`]/.test(password);

  const diversityCount = [lowercase, uppercase, numbers, symbols].filter(Boolean).length;
  const charsetSize = getCharsetSize(password);
  const entropy = Math.round(length * Math.log2(charsetSize));

  const findings = [];
  const recommendations = [];
  let blacklistMatch = false;
  let dictionaryMatch = false;
  let keyboardMatch = false;
  let leetMatch = false;
  let repeatedMatch = false;
  let sequentialMatch = false;

  const cleanLower = password.toLowerCase();

  // 1. Common Password Blacklist Check
  if (COMMON_PASSWORDS.includes(cleanLower)) {
    blacklistMatch = true;
    findings.push({
      type: "blacklist",
      severity: "critical",
      message: "🚨 Password Found In Common Password List"
    });
  }

  // 2. Dictionary Word Detection (Minimum length 3 for words)
  // Check both direct substrings and normalized leetspeak substrings
  const normalized = normalizeLeet(password);
  let foundDictWord = null;
  let foundLeetWord = null;

  for (const word of DICTIONARY_WORDS) {
    if (word.length >= 3) {
      if (cleanLower.includes(word)) {
        foundDictWord = word;
      }
      if (normalized.includes(word) && !cleanLower.includes(word)) {
        foundLeetWord = word;
      }
    }
  }

  if (foundDictWord) {
    dictionaryMatch = true;
    findings.push({
      type: "dictionary",
      severity: "high",
      message: `⚠ Dictionary Word Found ("${foundDictWord}")`
    });
  }

  if (foundLeetWord) {
    leetMatch = true;
    findings.push({
      type: "leetspeak",
      severity: "medium",
      message: `⚠ Predictable Character Substitution ("${foundLeetWord}" variant)`
    });
  }

  // 3. Keyboard Pattern Detection
  let foundKeyboardPattern = null;
  for (const pattern of KEYBOARD_PATTERNS) {
    if (pattern.length >= 4 && cleanLower.includes(pattern)) {
      foundKeyboardPattern = pattern;
      break;
    }
  }

  if (foundKeyboardPattern) {
    keyboardMatch = true;
    findings.push({
      type: "keyboard",
      severity: "high",
      message: `⚠ Keyboard Pattern Detected ("${foundKeyboardPattern}")`
    });
  }

  // 4. Repeated Character Detection (e.g. aaaa, 1111)
  const repeatedRegex = /(.)\1{2,}/; // 3 or more of same character
  if (repeatedRegex.test(password)) {
    repeatedMatch = true;
    const match = password.match(repeatedRegex);
    findings.push({
      type: "repeated",
      severity: "medium",
      message: `⚠ Repeated Character Pattern ("${match[0]}")`
    });
  }

  // 5. Sequential Character Detection (e.g. abcde, 54321)
  // Check for consecutive letters or numbers in ascii value sequence
  let hasSequence = false;
  let sequenceExample = "";
  if (password.length >= 3) {
    for (let i = 0; i < password.length - 2; i++) {
      const code1 = password.charCodeAt(i);
      const code2 = password.charCodeAt(i + 1);
      const code3 = password.charCodeAt(i + 2);
      
      // Ascending (e.g. a-b-c)
      if (code2 === code1 + 1 && code3 === code2 + 1) {
        // Only trigger for alphanumeric
        if (/[a-zA-Z0-9]/.test(password[i])) {
          hasSequence = true;
          sequenceExample = password.slice(i, i + 3);
          break;
        }
      }
      // Descending (e.g. c-b-a)
      if (code2 === code1 - 1 && code3 === code2 - 1) {
        if (/[a-zA-Z0-9]/.test(password[i])) {
          hasSequence = true;
          sequenceExample = password.slice(i, i + 3);
          break;
        }
      }
    }
  }

  if (hasSequence) {
    sequentialMatch = true;
    findings.push({
      type: "sequential",
      severity: "medium",
      message: `⚠ Sequential Pattern Found ("${sequenceExample}")`
    });
  }

  // Length assessment
  let lengthRating = "Weak";
  if (length >= 16) lengthRating = "Excellent";
  else if (length >= 12) lengthRating = "Strong";
  else if (length >= 8) lengthRating = "Moderate";

  // Calculate score
  let score = 0;

  if (blacklistMatch) {
    score = 5; // Blacklist caps score at 5
  } else {
    // Base score from entropy: entropy 80+ maps to 90 points.
    let baseScore = Math.min(90, Math.round((entropy / 80) * 90));
    
    // Diversity bonus: up to 10 points
    const diversityBonus = diversityCount * 2.5; // up to 10
    
    score = baseScore + diversityBonus;

    // Apply deductions for findings
    if (dictionaryMatch) score -= 20;
    if (keyboardMatch) score -= 15;
    if (leetMatch) score -= 10;
    if (repeatedMatch) score -= 10;
    if (sequentialMatch) score -= 10;
    if (length < 8) score -= 25;

    // Capping
    score = Math.max(0, Math.min(100, Math.round(score)));
  }

  // If score is high but we have bad patterns, clamp it
  if (score > 60 && (dictionaryMatch || keyboardMatch)) {
    score = 60; // Clamp to Good / Weak boundary
  }

  // Map score to rating brackets
  let label = "Critical";
  if (score > 80) label = "Excellent";
  else if (score > 60) label = "Good";
  else if (score > 30) label = "Weak";

  // Generate Recommendations
  if (length < 12) {
    recommendations.push("Increase password length to 12-16+ characters. Length is key to cracking resistance.");
  }
  if (diversityCount < 3) {
    recommendations.push("Mix character types: combine uppercase letters, lowercase letters, numbers, and symbols.");
  }
  if (!uppercase) {
    recommendations.push("Add at least one UPPERCASE letter.");
  }
  if (!numbers) {
    recommendations.push("Add at least one number (0-9).");
  }
  if (!symbols) {
    recommendations.push("Add at least one special character symbol (e.g., @, #, $, %).");
  }
  if (dictionaryMatch || leetMatch) {
    recommendations.push("Avoid dictionary words or common phrases. Consider using a multi-word passphrase of random, unrelated words.");
  }
  if (keyboardMatch) {
    recommendations.push("Avoid sequential keyboard rows or sequences (like 'qwerty' or 'asdfgh').");
  }
  if (repeatedMatch || sequentialMatch) {
    recommendations.push("Remove repeated characters (like 'aaa') or alphabetical/numerical sequences (like 'abc' or '123').");
  }
  if (recommendations.length === 0) {
    recommendations.push("Your password is exceptionally strong. Keep practicing safe credential storage!");
  }

  // Realistic GPU crack time estimate based on entropy
  let crackTime = "Instant";
  if (entropy > 0) {
    const attempts = Math.pow(2, entropy);
    const hashesPerSecond = 1e11; // 100 Billion attempts/sec (high-end GPU array)
    const seconds = attempts / hashesPerSecond;

    if (seconds < 1) crackTime = "Instant";
    else if (seconds < 60) crackTime = "Instant (seconds)";
    else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} Minutes`;
    else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} Hours`;
    else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} Days`;
    else {
      const years = seconds / 31536000;
      if (years < 1000) crackTime = `${Math.round(years)} Years`;
      else if (years < 1e6) crackTime = `${Math.round(years / 1000)} Thousand Years`;
      else if (years < 1e9) crackTime = `${Math.round(years / 1e6)} Million Years`;
      else crackTime = `${(years / 1e9).toFixed(1)} Billion Years`;
    }
  }

  return {
    score,
    label,
    entropy,
    length,
    lengthRating,
    charsetSize,
    diversity: { lowercase, uppercase, numbers, symbols },
    findings,
    recommendations,
    crackTime
  };
}
