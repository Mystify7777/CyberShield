import axios from "axios";
import { logError, logInfo, maskEmail } from "./logger.js";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export const sendEmail = async (to, subject, text) => {
  if (process.env.EMAIL_MOCK === "true") {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "CyberShield";

  if (!apiKey || !senderEmail) {
    throw new Error(
      "Email delivery failed. BREVO_API_KEY and BREVO_SENDER_EMAIL must be set, or set EMAIL_MOCK=true for local development."
    );
  }

  logInfo("EMAIL", "Sending email via Brevo", { to: maskEmail(to), subject });

  try {
    await axios.post(
      BREVO_API_URL,
      {
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        textContent: text
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        timeout: 10000
      }
    );

    logInfo("EMAIL", "Email sent successfully via Brevo", { to: maskEmail(to) });
  } catch (error) {
    const brevoMessage = error?.response?.data?.message || error?.message;
    logError("EMAIL", "Brevo email delivery error", brevoMessage);
    throw new Error(
      "Email delivery failed. Check BREVO_API_KEY/BREVO_SENDER_EMAIL, or set EMAIL_MOCK=true for local development."
    );
  }
};
