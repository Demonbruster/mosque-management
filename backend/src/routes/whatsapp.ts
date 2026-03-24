// ============================================
// Twilio WhatsApp Webhook Routes
// ============================================
// Handles incoming WhatsApp messages from Twilio.
// GET  — Webhook verification
// POST — Incoming message processing
// ============================================

import { Hono } from "hono";
import type { Env } from "../db/client";
import { sendWhatsAppMessage } from "../lib/twilio";

const whatsappRoute = new Hono<{ Bindings: Env }>();

/**
 * GET /api/whatsapp/webhook
 * Twilio webhook verification (if using custom verification).
 */
whatsappRoute.get("/webhook", (c) => {
  return c.json({
    status: "ok",
    message: "WhatsApp webhook is active",
  });
});

/**
 * POST /api/whatsapp/webhook
 * Receives incoming WhatsApp messages from Twilio.
 * Process and respond to messages here.
 */
whatsappRoute.post("/webhook", async (c) => {
  try {
    const body = await c.req.parseBody();

    const from = body["From"] as string;
    const messageBody = body["Body"] as string;
    const messageSid = body["MessageSid"] as string;

    console.log(`[WHATSAPP] Incoming message from ${from}: ${messageBody}`);

    // TODO: Implement message routing and response logic
    // Examples:
    //   - "BALANCE" → return account balance
    //   - "DONATE <amount>" → create a pending transaction
    //   - "STATUS" → return membership status

    // Send an auto-reply acknowledgement
    const phoneNumber = from.replace("whatsapp:", "");
    await sendWhatsAppMessage(
      {
        accountSid: c.env.TWILIO_ACCOUNT_SID,
        authToken: c.env.TWILIO_AUTH_TOKEN,
        whatsappNumber: c.env.TWILIO_WHATSAPP_NUMBER,
      },
      phoneNumber,
      "Assalamu Alaikum! Your message has been received. We will get back to you shortly. — Mosque Management System"
    );

    // Twilio expects a 200 response
    return c.text("OK", 200);
  } catch (error) {
    console.error("[WHATSAPP] Webhook error:", error);
    return c.text("OK", 200); // Always return 200 to Twilio
  }
});

export default whatsappRoute;
