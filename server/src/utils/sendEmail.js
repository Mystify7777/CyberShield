import { BrevoClient } from "@getbrevo/brevo";

const brevoClient = process.env.BREVO_API_KEY
  ? new BrevoClient({ apiKey: process.env.BREVO_API_KEY })
  : null;

const getSender = () => ({
  email: process.env.BREVO_SENDER_EMAIL,
  name: process.env.BREVO_SENDER_NAME || "CyberShield"
});

export const sendEmail = async (to, subject, text) => {
  if (process.env.EMAIL_MOCK === "true") {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }

  if (!brevoClient) {
    throw new Error("Brevo is not configured. Set BREVO_API_KEY, BREVO_SENDER_EMAIL, and BREVO_SENDER_NAME.");
  }

  if (!process.env.BREVO_SENDER_EMAIL) {
    throw new Error("Brevo sender email is missing. Set BREVO_SENDER_EMAIL to a verified sender.");
  }

  console.log(`[MAIL] Sending email to ${to} with subject "${subject}"`);

  try {
    const result = await brevoClient.transactionalEmails.sendTransacEmail({
      sender: getSender(),
      to: [{ email: to }],
      subject,
      textContent: text,
      htmlContent: `<html><body><pre style="font-family:inherit;white-space:pre-wrap;line-height:1.5">${String(text)}</pre></body></html>`
    });

    console.log(`[MAIL] Email sent successfully to ${to}`, result?.data ?? result);
  } catch (error) {
    console.error("Email delivery error:", error?.rawResponse?.body || error?.message || error);
    throw new Error("Email delivery failed. Check your Brevo API key, verified sender email, and account sending permissions.");
  }
};