// ============================================
// Twilio WhatsApp Client Helper
// ============================================

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
}

/**
 * Send a WhatsApp message via Twilio API.
 * Compatible with Cloudflare Workers (uses fetch).
 */
export async function sendWhatsAppMessage(
  config: TwilioConfig,
  to: string,
  body: string,
  mediaUrl?: string,
): Promise<Response> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

  const params = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: config.whatsappNumber,
    Body: body,
  });

  if (mediaUrl) {
    params.append('MediaUrl', mediaUrl);
  }

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
    },
    body: params.toString(),
  });
}

/**
 * Verify Twilio webhook signature.
 * TODO: Implement full signature verification for production.
 */
export function verifyTwilioSignature(
  authToken: string,
  signature: string,
  url: string,
  params: Record<string, string>,
): boolean {
  // TODO: Implement HMAC-SHA1 signature verification
  // See: https://www.twilio.com/docs/usage/security#validating-requests
  console.warn('[TWILIO] Signature verification not yet implemented');
  return true;
}
