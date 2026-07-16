// Starter phishing-awareness question bank.
// Each question has a server-only correctOptionId so the client never receives
// the answer — rewardGame() validates submissions against this module directly.

const QUESTIONS = [
  {
    id: "q1",
    prompt:
      "You get an email from \"support@paypa1-secure.com\" saying your account will be suspended unless you verify your details within 1 hour. What's the biggest red flag?",
    options: [
      { id: "a", text: "The email uses your first name" },
      { id: "b", text: "The domain 'paypa1-secure.com' isn't PayPal's real domain, and it creates urgency" },
      { id: "c", text: "The email has a logo in it" },
      { id: "d", text: "The email arrived in the evening" }
    ],
    correctOptionId: "b",
    explanation: "Lookalike domains (paypa1 with a '1' instead of 'l') combined with urgent deadlines are classic phishing tactics."
  },
  {
    id: "q2",
    prompt:
      "A message claims to be from your bank and includes a link. Hovering over the link shows it actually points to 'bit.ly/3xR7kP'. What should you do?",
    options: [
      { id: "a", text: "Click it since it's probably just a shortened version of the bank's URL" },
      { id: "b", text: "Don't click it — go directly to the bank's site by typing the URL yourself or using a saved bookmark" },
      { id: "c", text: "Reply to the email asking if it's legitimate" },
      { id: "d", text: "Forward it to a friend to see if they got the same one" }
    ],
    correctOptionId: "b",
    explanation: "Shortened links can hide the true destination. Legitimate banks don't typically link through URL shorteners, so navigate directly instead."
  },
  {
    id: "q3",
    prompt:
      "You receive an email attachment named 'Invoice_2024.pdf.exe' from an unknown sender. What does the double extension suggest?",
    options: [
      { id: "a", text: "It's a compressed PDF file" },
      { id: "b", text: "It's likely an executable program disguised as a PDF" },
      { id: "c", text: "It's a normal naming convention for invoices" },
      { id: "d", text: "It means the file was scanned for viruses already" }
    ],
    correctOptionId: "b",
    explanation: "A '.exe' after '.pdf' means the real file type is an executable, not a document — a common trick to get victims to run malware."
  },
  {
    id: "q4",
    prompt:
      "Your 'coworker' emails asking you to urgently buy gift cards and send the codes because they're 'in a meeting and can't talk.' What is this?",
    options: [
      { id: "a", text: "A normal work request" },
      { id: "b", text: "A gift card / CEO fraud scam" },
      { id: "c", text: "A phishing test from IT" },
      { id: "d", text: "A billing error" }
    ],
    correctOptionId: "b",
    explanation: "Urgent, hard-to-verify requests for gift cards are a well-known impersonation scam — always verify through a separate channel like a phone call."
  },
  {
    id: "q5",
    prompt:
      "A pop-up says 'Your device has 3 viruses! Click here to remove them now.' What's the safest response?",
    options: [
      { id: "a", text: "Click the button to remove the viruses immediately" },
      { id: "b", text: "Close the pop-up/browser tab and run a scan using trusted, already-installed antivirus software" },
      { id: "c", text: "Call the phone number shown in the pop-up" },
      { id: "d", text: "Enter your password to authorize the removal" }
    ],
    correctOptionId: "b",
    explanation: "Scareware pop-ups are designed to panic you into clicking or calling a fake support number. Legitimate antivirus software doesn't alert you this way."
  },
  {
    id: "q6",
    prompt:
      "An email addressed to 'Dear Customer' claims you won a prize and just need to 'pay a small shipping fee' to claim it. What should raise suspicion?",
    options: [
      { id: "a", text: "Generic greeting plus an unexpected prize requiring upfront payment" },
      { id: "b", text: "The email has a return address" },
      { id: "c", text: "The prize is a physical item" },
      { id: "d", text: "The email includes a company name" }
    ],
    correctOptionId: "a",
    explanation: "Legitimate prizes don't require you to pay first, and generic greetings suggest a mass-sent scam rather than a personal notification."
  },
  {
    id: "q7",
    prompt:
      "You're asked to log in through a link to 'confirm your identity' before a video call. The login page looks like your company's SSO page but the URL is slightly different. What should you do?",
    options: [
      { id: "a", text: "Log in since the page looks correct" },
      { id: "b", text: "Do not enter credentials; report the link to IT/security and access the real SSO page directly" },
      { id: "c", text: "Log in but change your password afterward" },
      { id: "d", text: "Try logging in with a fake password to test it" }
    ],
    correctOptionId: "b",
    explanation: "A visually identical but differently-URL'd login page is a classic credential-harvesting technique. Never enter real credentials — verify through official channels instead."
  },
  {
    id: "q8",
    prompt:
      "A text message claims to be from a delivery service, saying a package couldn't be delivered and asks you to click a link and pay a small redelivery fee. What is this most likely?",
    options: [
      { id: "a", text: "A normal delivery notification" },
      { id: "b", text: "Smishing (SMS phishing) targeting payment details" },
      { id: "c", text: "A promotional text" },
      { id: "d", text: "An automated system update" }
    ],
    correctOptionId: "b",
    explanation: "Unsolicited texts asking for small payments via a link are a common smishing tactic to harvest card details — verify directly with the carrier instead of clicking."
  }
];

export const getPublicQuestions = () => {
  return QUESTIONS.map(({ id, prompt, options }) => ({
    id,
    prompt,
    options: options.map(({ id: optionId, text }) => ({ id: optionId, text }))
  }));
};

export const validateAnswer = (questionId, answerId) => {
  const question = QUESTIONS.find((q) => q.id === questionId);

  if (!question) {
    return { valid: false, error: "Question not found" };
  }

  const optionExists = question.options.some((option) => option.id === answerId);
  if (!optionExists) {
    return { valid: false, error: "Invalid answer option" };
  }

  if (answerId !== question.correctOptionId) {
    return { valid: false, error: question.explanation || "Incorrect answer", explanation: question.explanation };
  }

  return { valid: true, explanation: question.explanation };
};