const SIGNALS = [
  {
    name: "Urgency",
    weight: 24,
    pattern: /\b(urgent|immediately|now|today|within|locked|suspended|final warning)\b/i,
  },
  {
    name: "Suspicious link",
    weight: 28,
    pattern: /(https?:\/\/|bit\.ly|tinyurl|\.top|\.xyz|fake|verify[-.]?now)/i,
  },
  {
    name: "OTP or credential request",
    weight: 28,
    pattern: /\b(otp|password|pin|login|credential|verify|account)\b/i,
  },
  {
    name: "Reward bait",
    weight: 18,
    pattern: /\b(prize|reward|cashback|claim|voucher|winner|free)\b/i,
  },
  {
    name: "Threat or pressure",
    weight: 20,
    pattern: /\b(police|arrest|fine|court|investigation|penalty|debt)\b/i,
  },
  {
    name: "Payment request",
    weight: 22,
    pattern: /\b(paynow|transfer|deposit|fee|wallet|crypto|bank)\b/i,
  },
];

export function analyzeMessage(message) {
  const trimmed = message.trim();
  const matched = SIGNALS.filter((signal) => signal.pattern.test(trimmed));
  const lengthBoost = trimmed.length > 140 ? 8 : 0;
  const punctuationBoost = /!!!|[A-Z]{5,}/.test(trimmed) ? 6 : 0;
  const score = Math.min(
    99,
    matched.reduce((total, signal) => total + signal.weight, 0) + lengthBoost + punctuationBoost
  );

  let level = "Low";
  if (score >= 75) level = "High";
  else if (score >= 40) level = "Medium";

  return {
    level,
    score,
    signals: matched.map((signal) => signal.name),
    summary:
      matched.length === 0
        ? "No obvious manipulation pattern found. Keep checking the sender and context."
        : `Detected ${matched.length} manipulation pattern${matched.length > 1 ? "s" : ""}.`,
  };
}

export function buildStallReply(level) {
  if (level === "High") {
    return "I am not sure I understand. Can you tell me which department you are from, your full case reference, and why the number on the official website is different?";
  }

  if (level === "Medium") {
    return "Before I do anything, can you send the official website link and explain why this request cannot wait until I call the main hotline?";
  }

  return "Thanks for checking in. I will verify this through the official channel first.";
}
