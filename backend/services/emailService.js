const nodemailer = require("nodemailer");

const parsePort = (value, fallback) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const emailConfig = {
  host: String(process.env.SMTP_HOST || "").trim(),
  port: parsePort(process.env.SMTP_PORT, 587),
  secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  user: String(process.env.SMTP_USER || "").trim(),
  pass: String(process.env.SMTP_PASS || "").trim(),
  from: String(process.env.SMTP_FROM || "").trim(),
};

const hasEmailConfig = () => {
  if (!emailConfig.host || !emailConfig.from) return false;
  if (emailConfig.user && !emailConfig.pass) return false;
  return true;
};

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  if (!hasEmailConfig()) return null;

  const auth = emailConfig.user ? { user: emailConfig.user, pass: emailConfig.pass } : undefined;
  transporter = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth,
  });
  return transporter;
};

const sendResetOtpEmail = async ({ to, name, otp, expiryMinutes }) => {
  const smtp = getTransporter();
  if (!smtp) {
    return { sent: false, reason: "not_configured" };
  }

  const safeName = String(name || "User").trim() || "User";
  const subject = "ASWAMITHRA Password Reset OTP";
  const text = `Hi ${safeName}, your OTP for password reset is ${otp}. It expires in ${expiryMinutes} minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin-bottom: 8px;">Password Reset OTP</h2>
      <p>Hi ${safeName},</p>
      <p>Your ASWAMITHRA password reset OTP is:</p>
      <p style="font-size: 24px; font-weight: 700; letter-spacing: 4px; margin: 12px 0;">${otp}</p>
      <p>This OTP will expire in <strong>${expiryMinutes} minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  const result = await smtp.sendMail({
    from: emailConfig.from,
    to,
    subject,
    text,
    html,
  });

  return { sent: true, messageId: result.messageId };
};

module.exports = {
  hasEmailConfig,
  sendResetOtpEmail,
};
