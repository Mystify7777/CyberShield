/**
 * Legacy client-side questions data.
 * NOTE: These are for reference only. Answers are removed to prevent client-side spoofing.
 * Fetch authoritative questions from GET /api/game/questions endpoint instead.
 * 
 * DO NOT expose answers in production builds!
 */

export const phishingQuestions = [
  {
    id: "q1",
    text: "Your account is suspended. Click here to verify immediately.",
    explanation: "Urgency plus verification links is a common phishing pattern."
  },
  {
    id: "q2",
    text: "Reminder: Your electricity bill is due next week.",
    explanation: "Routine billing reminders without pressure are generally normal."
  },
  {
    id: "q3",
    text: "You won INR 5,00,000 lottery! Claim now.",
    explanation: "Unexpected prize claims are classic scam bait."
  },
  {
    id: "q4",
    text: "Security update: We never ask for your OTP over calls or messages.",
    explanation: "General security awareness notices are legitimate informational content."
  },
  {
    id: "q5",
    text: "Your KYC failed. Share PAN and OTP now to avoid account freeze.",
    explanation: "Requests for sensitive credentials with urgency indicate phishing."
  }
];

