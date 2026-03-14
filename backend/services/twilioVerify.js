const VERIFY_BASE_URL = "https://verify.twilio.com/v2/Services";

const isTwilioConfigured = () =>
  Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_VERIFY_SID);

const buildAuthHeader = () => {
  const raw = `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`;
  return `Basic ${Buffer.from(raw).toString("base64")}`;
};

const normalizePhone = (value) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const sendPhoneOtp = async (phone) => {
  if (!isTwilioConfigured()) {
    return { sent: false, reason: "twilio_not_configured" };
  }

  const to = normalizePhone(phone);
  const res = await fetch(`${VERIFY_BASE_URL}/${process.env.TWILIO_VERIFY_SID}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, Channel: "sms" }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    return { sent: false, reason: text || "twilio_error" };
  }

  return { sent: true };
};

const verifyPhoneOtp = async (phone, code) => {
  if (!isTwilioConfigured()) {
    return { verified: false, reason: "twilio_not_configured" };
  }

  const to = normalizePhone(phone);
  const res = await fetch(`${VERIFY_BASE_URL}/${process.env.TWILIO_VERIFY_SID}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: buildAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, Code: code }).toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    return { verified: false, reason: text || "twilio_error" };
  }

  const data = await res.json();
  return { verified: data?.status === "approved", status: data?.status };
};

module.exports = {
  isTwilioConfigured,
  sendPhoneOtp,
  verifyPhoneOtp,
};
