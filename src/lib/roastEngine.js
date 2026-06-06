// Multi-style Password Roast Engine

const ROASTS = {
  expert: {
    critical: [
      "Congratulations. You selected the world's favorite password. Even my toaster has a higher security rating.",
      "Hackers guessed this before you finished typing it. We recommend checking your router for signs of life.",
      "This password belongs in a cybersecurity museum. Specifically, in the 'How Not to Secure' exhibit.",
      "Very welcoming. Especially to attackers who don't even need to turn on their screen to guess it.",
      "This password has appeared in more breaches than some social media trends."
    ],
    weak: [
      "This is barely a speed bump. A high-schooler with a laptop could crack this between classes.",
      "Your password length is like a short story. Specifically, a tragedy.",
      "If safety was a building, your password is a door with 'Welcome' written on it and no lock.",
      "You've basically built a firewall out of tissue paper. Good luck."
    ],
    good: [
      "Nice disguise. Hackers have seen that costume before.",
      "You changed a few letters and expected magic. That's cute.",
      "The keyboard pattern is still visible from space. Let's do better.",
      "It's decent, but it still smells like a dictionary word with an exclamation mark at the end."
    ],
    excellent: [
      "Now we're talking. Attackers just switched to an easier target, like your smart fridge.",
      "This password files taxes, pays rent, and probably monitors its own credit score.",
      "If entropy was a superpower, you'd be wearing a cape right now.",
      "Genuinely impressive. A brute-force cluster would expire before breaking this."
    ]
  },
  villain: {
    critical: [
      "HAHAHA! Yes, please keep using this! It makes conquering your digital empire so much faster!",
      "A cardboard shield? How adorable! My cyber-laser will cut through this in 0.001 seconds!",
      "Did you get this password from a cereal box, citizen? Minions, prepare the brute-force blaster!",
      "An open gate! Excellent, my army of bots will march right in without breaking a sweat!"
    ],
    weak: [
      "You think this meager string of characters can stop my doomsday algorithm? Think again!",
      "I have seen wet noodles with more structural integrity than this password.",
      "A weak defense! You make it far too easy for the forces of evil!"
    ],
    good: [
      "Hmm, a slight obstacle. You replaced 'a' with '@'. How... devious. It will take my minions at least five minutes!",
      "A minor speedbump in my master plan. But do not worry, my botnets will eventually breach this!",
      "Ah, a shield! But it has holes. I will locate them soon enough, hero!"
    ],
    excellent: [
      "Curse you, hero! This security wall is impenetrable! My master plan has been foiled by pure entropy!",
      "What is this witchcraft?! A password with actual special characters? Dr. Doom would be displeased.",
      "Ah! The complexity! It burns my scanners! I shall retreat... for now!"
    ]
  },
  corporate: {
    critical: [
      "Dear User, we received your Master Password check. We've automatically cc'd our legal department to draft your exit paperwork.",
      "Hi there, just checking in. Is this password a cry for help? Please open a ticket under 'Complete Security Failure'.",
      "Per our previous email, using 'password123' does not count as a multi-factor authentication strategy. Regards.",
      "Please note: your Master Password does not meet the requirements of having at least one spark of creativity."
    ],
    weak: [
      "We recommend you review our security policy before the auditors find out you're using this.",
      "Our system has flagged your password as 'Highly Optimistic'. Please update it to something realistic.",
      "This password will work great if you're trying to share all your documents with the public."
    ],
    good: [
      "Hello, thanks for the update. While your password isn't a total disaster, we still recommend not writing it on a sticky note attached to your monitor.",
      "Hi, we noticed you used some numbers. Progress! However, it still doesn't meet our ISO-27001 policy. Please resolve this.",
      "A solid attempt, but our security team is still crying in the breakroom."
    ],
    excellent: [
      "Dear User, we are pleased to inform you that your password has caused our automated scanner to crash from complexity. Outstanding job.",
      "Good day. This password is so secure that we will probably lock your account ourselves just to feel in control. Regards.",
      "Excellent. We have updated your status to 'Sysadmin Approved'. You may proceed with your duties."
    ]
  },
  gamer: {
    critical: [
      "Bro, your password is literally 1 HP. My grandma can speedrun hacking this.",
      "Default skin energy. Uninstall your keyboard immediately.",
      "Are you laggy or is your brain just offline? That password is an absolute skill issue.",
      "Bro is playing security on 'Very Easy' mode. Get gud."
    ],
    weak: [
      "Noob tier defense. You're getting spawn-camped by script kiddies with this setup.",
      "Bro typed this with one finger while eating chips. Absolute throw.",
      "Your security barrier is like glass. Actually, glass can hurt you when it breaks, this won't."
    ],
    good: [
      "Mid. Honestly, mid. You put a number at the end, did you get that from a tutorial?",
      "Okay, you got some uppercase, but your defense is still paper tier. 1v1 me on a brute-force rig.",
      "Not bad, but still getting easily counter-played by standard dictionaries. Level up."
    ],
    excellent: [
      "Sheesh, this password is absolute meta. Total aimbot level security. Certified cracked.",
      "Giga-chad password detected. The hackers are malting and rage-quitting right now.",
      "Bro is scripting. There is no way you typed this complex beast raw. Absolutely insane hacks."
    ]
  }
};

/**
 * Returns a roast based on password rating label and selected style
 * @param {string} label The strength label (Critical, Weak, Good, Excellent)
 * @param {string} style The roast style ('expert', 'villain', 'corporate', 'gamer')
 * @returns {string} The roast sentence
 */
export function getRoast(label, style = "expert") {
  const selectedStyle = ROASTS[style] ? style : "expert";
  const labelKey = label.toLowerCase();
  
  // Map labels to available roast keys
  let category = "weak";
  if (labelKey === "critical") category = "critical";
  else if (labelKey === "weak") category = "weak";
  else if (labelKey === "good" || labelKey === "fair") category = "good";
  else if (labelKey === "excellent" || labelKey === "military grade" || labelKey === "military") category = "excellent";
  
  const list = ROASTS[selectedStyle][category];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex];
}
