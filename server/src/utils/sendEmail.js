import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  if (process.env.EMAIL_MOCK === "true") {
    console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject} | Body: ${text}`);
    return;
  }

  console.log(`[MAIL] Sending email to ${to} with subject "${subject}"`);

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log(`[MAIL] Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Email delivery error:", error?.message || error);
    throw new Error("Email delivery failed. Use a Gmail App Password or set EMAIL_MOCK=true for local development.");
  }
};
