/**
 * Authoritative phishing game questions and answers.
 * Stored server-side to prevent client-side spoofing.
 * Answers are never sent to client via the public endpoint.
 */

export const phishingQuestionBank = [
  {
    id: "q1",
    text: "Your account is suspended. Click here to verify immediately.",
    explanation: "Urgency plus verification links is a common phishing pattern.",
    answer: "SCAM"
  },
  {
    id: "q2",
    text: "Reminder: Your electricity bill is due next week.",
    explanation: "Routine billing reminders without pressure are generally normal.",
    answer: "SAFE"
  },
  {
    id: "q3",
    text: "You won INR 5,00,000 lottery! Claim now.",
    explanation: "Unexpected prize claims are classic scam bait.",
    answer: "SCAM"
  },
  {
    id: "q4",
    text: "Security update: We never ask for your OTP over calls or messages.",
    explanation: "General security awareness notices are legitimate informational content.",
    answer: "SAFE"
  },
  {
    id: "q5",
    text: "Your KYC failed. Share PAN and OTP now to avoid account freeze.",
    explanation: "Requests for sensitive credentials with urgency indicate phishing.",
    answer: "SCAM"
  }
];

// Helper: get questions without answers (for public API)
export const getPublicQuestions = () => {
  return phishingQuestionBank.map(({ id, text, explanation }) => ({
    id,
    text,
    explanation
  }));
};

// Helper: validate an answer
export const validateAnswer = (questionId, submittedAnswer) => {
  const question = phishingQuestionBank.find((q) => q.id === questionId);
  if (!question) {
    return { valid: false, error: "Question not found" };
  }
  if (submittedAnswer !== question.answer) {
    return { valid: false, error: "Incorrect answer" };
  }
  return { valid: true };
};
