/* ═══════════════════════════════════════════
   Krishi Sangam — server/lib/sms.js
   Real SMS delivery via Knock (https://knock.app)

   When KNOCK_API_KEY is set (production), OTP codes are delivered as a real
   SMS through the Knock workflow 'otp-verification'. The workflow must have
   an SMS channel step wired to a provider (Twilio / Plivo / Vonage / etc.)
   configured in the Knock dashboard.

   When KNOCK_API_KEY is NOT set (local dev / demo), sending is skipped and
   the caller is told the OTP should be returned in the API response instead,
   so the flow remains testable without spending money.
   ═══════════════════════════════════════════ */

// Convert a 10-digit Indian mobile (e.g. "9876543210") to E.164 ("+919876543210").
function toE164(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

let knockInstance = null;
function getKnock() {
  const { Knock } = require('@knocklabs/node');
  if (!knockInstance) {
    knockInstance = new Knock({ apiKey: process.env.KNOCK_API_KEY });
  }
  return knockInstance;
}

/**
 * Send an OTP code to a phone number via SMS.
 *
 * @returns {Promise<{ delivered: true }>} when the SMS was handed to Knock.
 * @throws {Error} when KNOCK_API_KEY is configured but delivery fails — the
 *   OTP must NOT be leaked back to the client in production.
 *
 * When no KNOCK_API_KEY is configured (dev/demo), this does NOT throw: the
 * caller surfaces `devOtp` in the API response so the flow stays testable.
 */
async function sendOtp(phone, otp) {
  if (!process.env.KNOCK_API_KEY) {
    return { delivered: false, devOtp: otp };
  }

  const phoneE164 = toE164(phone);
  // Use the phone number itself as a stable Knock recipient identifier.
  const recipientId = `phone:${phoneE164}`;

  const knock = getKnock();
  await knock.users.identify(recipientId, { phone_number: phoneE164 });
  await knock.workflows.trigger('otp-verification', {
    recipients: [recipientId],
    data: { otp, phone: phoneE164 }
  });
  console.log(`[SMS] OTP sent via Knock to ${phoneE164}`);
  return { delivered: true };
}

module.exports = { sendOtp, toE164 };