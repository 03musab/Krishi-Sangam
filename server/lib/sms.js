/* ═══════════════════════════════════════════
   Krishi Sangam — server/lib/sms.js
   OTP delivery via 2Factor.in (https://2factor.in) — India's OTP SMS API.

   Provider priority:
     1. 2Factor.in  — when TFACTOR_API_KEY is set (V1 endpoint, session_id)
     2. TextBee     — when TEXTBEE_API_KEY + TEXTBEE_DEVICE_ID are set
     3. Msg91       — when MSG91_AUTH_KEY + MSG91_OTP_TEMPLATE_ID are set
     4. Dev mode    — no provider: the OTP is returned in the API response (devOtp)

   Required env var (for 2Factor.in real SMS):
     TFACTOR_API_KEY — 2Factor.in dashboard → API key
   Optional:
     TFACTOR_TEMPLATE_NAME — DLT template name (V2 only; V1 works without it)

   Real deliveries throw on failure so the OTP is never leaked back to the
   client; errors carry a `publicMessage` safe to show to the user.
   ═══════════════════════════════════════════ */

// Convert a 10-digit Indian mobile (e.g. "9876543210") to E.164 ("+919876543210").
function toE164(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return `+${digits}`;
}

function tfactorConfig() {
  const apiKey = process.env.TFACTOR_API_KEY;
  return apiKey ? { apiKey, templateName: process.env.TFACTOR_TEMPLATE_NAME || null } : null;
}

function textbeeConfig() {
  const apiKey = process.env.TEXTBEE_API_KEY;
  const deviceId = process.env.TEXTBEE_DEVICE_ID;
  return apiKey && deviceId ? { apiKey, deviceId } : null;
}

function msg91Config() {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_OTP_TEMPLATE_ID;
  return authKey && templateId ? { authKey, templateId } : null;
}

/* ── 2Factor.in sender ─────────────────────── */
async function sendViaTfactor(phone, otp, { apiKey, templateName }) {
  // V1 (no template) is used unless a template name is configured (V2).
  let mobile = String(phone).replace(/\D/g, '');
  // Normalize a "91XXXXXXXXXX" input to a bare 10-digit number for the V1/V2 path.
  if (/^91\d{10}$/.test(mobile)) mobile = mobile.slice(2);
  const url = templateName
    ? `https://2factor.in/API/V2/${encodeURIComponent(apiKey)}/SMS/${mobile}/${otp}/${encodeURIComponent(templateName)}`
    : `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${mobile}/${otp}`;

  console.log(`[SMS] Sending OTP via 2Factor.in to ${toE164(phone)}${templateName ? ` (template ${templateName})` : ' (V1)'}`);

  let res;
  try {
    res = await fetch(url, { method: 'POST' });
  } catch (err) {
    err.publicMessage = 'SMS service unreachable. Please try again.';
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    // HTML 404 (e.g. an unregistered V2 template name) comes back non-JSON.
    const err = new Error('2Factor.in returned an unreadable response.');
    err.publicMessage = res.status === 404
      ? 'SMS failed: template not found. Check TFACTOR_TEMPLATE_NAME (DLT template).'
      : 'SMS service returned an unexpected response. Please try again.';
    throw err;
  }

  // Success shape: { "Status": "Success", "Details": "<session_id>" }
  if (data && data.Status === 'Success') {
    return { delivered: true, provider: '2factor', requestId: data.Details };
  }

  const rawMessage = (data && data.Details) || (data && data.Message) || `HTTP ${res.status}`;
  const err = new Error(`2Factor.in: ${rawMessage}`);
  err.publicMessage = `SMS failed: ${rawMessage}.`;
  if (/invalid.*api[ _-]?key|api[ _-]?key.*invalid/i.test(rawMessage)) {
    err.publicMessage = 'SMS service rejected the API key. Please check the 2Factor.in configuration.';
  }
  if (/balance|insufficient/i.test(rawMessage)) {
    err.publicMessage = 'SMS balance is low. Please top up the 2Factor.in account.';
  }
  if (/template|DLT|dlt/i.test(rawMessage)) {
    err.publicMessage = 'SMS template not approved yet. Complete DLT setup in 2Factor.in.';
  }
  throw err;
}

/* ── TextBee sender ─────────────────────────── */
async function sendViaTextbee(phone, otp, { apiKey, deviceId }) {
  const recipient = toE164(phone);
  const message = `Your Krishi Sangam OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`;
  console.log(`[SMS] Sending OTP via TextBee to ${recipient}`);

  let res;
  try {
    res = await fetch(`https://api.textbee.dev/api/v1/gateway/devices/${encodeURIComponent(deviceId)}/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ recipients: [recipient], message })
    });
  } catch (err) {
    err.publicMessage = 'SMS service unreachable. Please try again.';
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    const err = new Error('TextBee returned an unreadable response.');
    err.publicMessage = 'SMS service returned an unexpected response. Please try again.';
    throw err;
  }

  // Success shape: { data: { success: true, smsBatchId, ... } } (HTTP 201)
  if (data && data.data && data.data.success === true) {
    return { delivered: true, provider: 'textbee', requestId: data.data.smsBatchId };
  }

  const rawMessage = (data && data.message) || (data && data.error) || `HTTP ${res.status}`;
  const err = new Error(`TextBee: ${rawMessage}`);
  err.publicMessage = `SMS failed: ${rawMessage}.`;
  if (/unauthorized|invalid.*key|api[ _-]?key/i.test(rawMessage)) {
    err.publicMessage = 'SMS service rejected the API key or device. Please check the TextBee configuration.';
  }
  if (/offline|disconnected|not.*connect/i.test(rawMessage)) {
    err.publicMessage = 'The TextBee device is offline. Make sure the Android phone is on and the app is running.';
  }
  if (/limit|quota|plan/i.test(rawMessage)) {
    err.publicMessage = 'TextBee message limit reached for this period. Upgrade or wait.';
  }
  throw err;
}

/* ── Msg91 sender (fallback) ────────────────── */
async function sendViaMsg91(phone, otp, { authKey, templateId }) {
  // Msg91 expects the mobile in 91XXXXXXXXXX form (country code, no +)
  const mobile = toE164(phone).replace('+', '');
  console.log(`[SMS] Sending OTP via Msg91 to +${mobile}`);

  const body = JSON.stringify({
    template_id: templateId,
    mobile,
    otp: String(otp),
    otp_expiry: 5, // minutes
    ...(process.env.MSG91_SENDER_ID ? { sender: process.env.MSG91_SENDER_ID } : {})
  });

  let res;
  try {
    res = await fetch('https://control.msg91.com/api/v5/otp', {
      method: 'POST',
      headers: { authkey: authKey, 'Content-Type': 'application/json' },
      body
    });
  } catch (err) {
    err.publicMessage = 'SMS service unreachable. Please try again.';
    throw err;
  }

  let data;
  try {
    data = await res.json();
  } catch {
    const err = new Error('Msg91 returned an unreadable response.');
    err.publicMessage = 'SMS service returned an unexpected response. Please try again.';
    throw err;
  }

  if (data.type === 'success') {
    return { delivered: true, provider: 'msg91', requestId: data.request_id };
  }

  const err = new Error(`Msg91: ${data.message || 'Unknown error'}`);
  err.publicMessage = `SMS failed: ${data.message || 'Unknown error'}.`;
  if (/insufficient balance|low balance/i.test(data.message || '')) {
    err.publicMessage = 'SMS balance is low. Please top up the Msg91 account.';
  }
  if (/template/i.test(data.message || '')) {
    err.publicMessage = 'SMS template not approved yet. Approve the OTP template in Msg91.';
  }
  throw err;
}

/**
 * Send an OTP code to a phone number. Provider priority:
 * 2Factor.in → TextBee → Msg91 → dev mode.
 *
 * @returns {Promise<{ delivered: true, provider: string, requestId } | { delivered: false, devOtp }>}
 * @throws {Error} when a provider is configured but delivery fails; the error
 *   carries a `publicMessage` safe to show to the user.
 */
async function sendOtp(phone, otp) {
  const tf = tfactorConfig();
  if (tf) return sendViaTfactor(phone, otp, tf);

  const tb = textbeeConfig();
  if (tb) return sendViaTextbee(phone, otp, tb);

  const mg = msg91Config();
  if (mg) return sendViaMsg91(phone, otp, mg);

  console.log('[SMS] No SMS provider configured — returning OTP in response (dev mode).');
  return { delivered: false, devOtp: otp };
}

/* ── TextBee delivery status ────────────────── */
async function checkTextbeeDelivery(requestId, { apiKey, deviceId }) {
  const res = await fetch(
    `https://api.textbee.dev/api/v1/gateway/devices/${encodeURIComponent(deviceId)}/sms-batch/${encodeURIComponent(requestId)}`,
    { headers: { 'x-api-key': apiKey } }
  );
  const data = await res.json();

  const batch = data && data.data && data.data.batch;
  const messages = data && data.data && data.data.messages;
  if (!batch) return { checked: false, reason: 'unexpected-response' };

  const msg = messages && messages[0];
  const status = String(batch.status || (msg && msg.status) || '').toUpperCase();
  if (status === 'FAILED') {
    return {
      checked: true,
      status: 'FAILED',
      reason: (msg && (msg.errorMessage || msg.errorCode)) || batch.status
    };
  }
  if (status === 'SENT' || status === 'DELIVERED' || status === 'SUCCESS') {
    return { checked: true, status: 'DELIVERED' };
  }
  return { checked: true, status: status || 'PENDING' };
}

/* ── Msg91 delivery status (fallback) ───────── */
async function checkMsg91Delivery(requestId, phone, { authKey }) {
  const mobile = toE164(phone).replace('+', '');
  const res = await fetch(
    `https://control.msg91.com/api/v5/otp/getStatus?request_id=${encodeURIComponent(requestId)}&mobile=${encodeURIComponent(mobile)}`,
    { headers: { authkey: authKey } }
  );
  const data = await res.json();

  if (data && data.type === 'success' && data.data) {
    const status = String(data.data.status || data.data.delivery_status || '').toUpperCase();
    if (status) return { checked: true, status };
  }
  if (data && (data.status === 'fail' || data.hasError)) {
    return { checked: false, reason: String(data.errors || data.message || 'unauthorized') };
  }
  return { checked: false, reason: 'unexpected-response' };
}

/**
 * Best-effort delivery-status check for a sent OTP. Dispatches to the same
 * provider that sent it. Not every provider/plan exposes status — callers
 * should degrade gracefully when { checked: false }.
 *
 * @param {string} requestId  the request_id/session/batch id from a successful sendOtp()
 * @param {string} phone      10-digit mobile the OTP was sent to
 * @param {string} provider   provider name returned by sendOtp()
 * @returns {Promise<{ checked: boolean, status?: string, reason?: string }>}
 */
async function checkOtpDelivery(requestId, phone, provider) {
  const tb = textbeeConfig();
  const mg = msg91Config();

  if (provider === 'textbee' && tb) {
    try {
      return await checkTextbeeDelivery(requestId, tb);
    } catch (err) {
      return { checked: false, reason: err.message };
    }
  }
  if (provider === 'msg91' && mg) {
    try {
      return await checkMsg91Delivery(requestId, phone, mg);
    } catch (err) {
      return { checked: false, reason: err.message };
    }
  }
  // 2Factor.in and unknown providers: no status endpoint available.
  return { checked: false, reason: 'no-status-endpoint' };
}

module.exports = { sendOtp, checkOtpDelivery, toE164 };
