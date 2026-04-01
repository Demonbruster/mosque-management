// ============================================
// Resend Email Helper
// ============================================

import { Resend } from 'resend';

export async function sendEmailReceipt(
  apiKey: string,
  to: string,
  donorName: string,
  pdfBuffer: Uint8Array,
  fileName: string,
): Promise<void> {
  if (!apiKey) {
    console.warn('[EMAIL] RESEND_API_KEY missing, skipping email');
    return;
  }

  const resend = new Resend(apiKey);

  // Note: For production, a verified domain is required
  // For sandbox testing, 'onboarding@resend.dev' can be used to send to the registered Resend account email
  await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: [to],
    subject: `Your Donation Receipt - ${fileName}`,
    html: `
      <div style="font-family: sans-serif; color: #333;">
        <h2>JazakAllah Khair, ${donorName}</h2>
        <p>Thank you for your generous contribution.</p>
        <p>Your official tax-deductible digital receipt is attached to this email.</p>
        <br />
        <p>Regards,<br/>Mosque Management Committee</p>
      </div>
    `,
    attachments: [
      {
        filename: `${fileName}.pdf`,
        content: Buffer.from(pdfBuffer),
      },
    ],
  });
}
