# TASK-010: Automated Digital Receipts (PDF + WhatsApp/Email)

**Epic:** Shariah-Compliant Financials (Manual Entry Phase)  
**Priority:** 🟠 P1 — High  
**Estimate:** 3 days  
**Labels:** `epic: financials`, `priority: high`, `type: backend`  
**Assignee:** _TBD (Backend Dev)_  
**Blocked by:** TASK-009  
**Blocks:** None

---

## 📋 Story

> **As a** donor,  
> **I want** to receive an instant PDF tax receipt via WhatsApp or email the moment my donation is approved,  
> **so that** I have proof of my contribution for personal records and tax purposes.

## 📝 Sub-Tasks

### Backend

- [ ] **ST-10.1** — Build PDF receipt generator using a library like `@react-pdf/renderer` or `pdfkit`:
  - Mosque name and address (from tenant config)
  - Receipt number (auto-generated sequential)
  - Donor name, amount, fund category
  - Date, payment method, reference number
  - Approval signature (approver name)
  - Footer with ISAK-35 compliance note
- [ ] **ST-10.2** — Create receipt number sequence: `MMS-{TENANT_SLUG}-{YYYY}-{SEQ}` (e.g., `MMS-MASJID-2026-00147`)
- [ ] **ST-10.3** — Add `receipt_number` and `receipt_pdf_url` columns to `transactions` table
- [ ] **ST-10.4** — Build auto-trigger: when a transaction moves to "Approved", generate PDF and store in Cloudflare R2 (or equivalent)
- [ ] **ST-10.5** — If donor has `whatsapp_opt_in = true` → send PDF via Twilio WhatsApp using existing `lib/twilio.ts`
- [ ] **ST-10.6** — If donor has email → send PDF via email (use Resend or similar transactional email service)
- [ ] **ST-10.7** — Build `GET /api/transactions/:id/receipt` — download the PDF receipt

### Frontend

- [ ] **ST-10.8** — Add "Download Receipt" button in transaction detail view (only for Approved transactions)
- [ ] **ST-10.9** — Show receipt delivery status on transaction record (WhatsApp sent ✓, Email sent ✓)

## 🧪 Acceptance Criteria

- [ ] PDF receipt generates with all required fields in correct format
- [ ] Receipt number is unique and sequential per tenant per year
- [ ] WhatsApp receipt is sent automatically within 30 seconds of approval (for opted-in donors)
- [ ] Email receipt is sent as PDF attachment (for donors with email)
- [ ] Receipt can be downloaded from the transaction detail page
