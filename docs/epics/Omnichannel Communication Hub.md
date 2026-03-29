Because WhatsApp is the primary communication channel for your congregation, this epic focuses on building a scalable, automated, and ban-proof messaging engine that integrates directly with your CRM.
Here is the breakdown of requirements to hand over to your development team:

1. Official WhatsApp Business API Infrastructure

- To ensure system stability and protect the mosque's reputation, the communication hub must be built exclusively on the official WhatsApp Business API (via a provider like Twilio).
- Bypassing App Limits: The system must overcome the standard WhatsApp Business app's 256-contact broadcast limit, allowing administrators to send messages to thousands of devotees simultaneously.
- Ban-Proof Architecture: The backend must connect via official API endpoints rather than unofficial web-scraping "blaster" tools, which carry a severe risk of permanent account bans and violate Meta's Terms of Service.

2. Advanced Audience Segmentation & Broadcasting

- The system must allow administrators to send highly targeted, personalized broadcasts rather than generic mass messages.
- Dynamic Filtering: The CRM must allow admins to filter the congregation by specific tags or attributes, such as geographical zones (Mahalla), event attendance, or donor status (e.g., recurring donors vs. first-time donors).
- Targeted Campaigns: Admins must be able to deploy specific campaigns (e.g., a 3-message sequence comprising a donation appeal, an impact story, and a final deadline reminder) directly to these segmented lists.

3. Template Management & Interactive Messaging

- To initiate conversations with devotees proactively, the system must comply with Meta's strict anti-spam rules.
- Pre-Approved Templates: The system must provide an interface for administrators to create, manage, and submit message templates for WhatsApp approval, as required for any business-initiated message sent outside a 24-hour customer service window.
- Dynamic Personalization & CTAs: Templates must support dynamic variables (e.g., automatically inserting {{First Name}} or {{Donation Amount}}) and rich media. They must also support interactive Call-To-Action (CTA) buttons, such as "Donate Now", "RSVP", or "Confirm Shift", making it frictionless for devotees to take action.

4. Automated Workflows & Chatbots

- The system should leverage automation to reduce the administrative burden on the mosque's staff and volunteers.
- The "Donation Concierge": An automated flow that instantly responds when a devotee texts a specific keyword (e.g., "DONATE"). The bot should thank them, ask which fund they wish to support (e.g., Zakat, General, Building), and automatically serve them the correct secure payment link.
- Volunteer & Event Coordination: Automated triggers that send out shift reminders or event confirmations. For example, a message sent 24 hours before a volunteer shift asking the user to "Reply 1 to confirm, or 2 if you need help," routing any complex responses directly to a human coordinator.

5. Strict Consent Management (Opt-In / Opt-Out)

- To maintain compliance with privacy regulations (like GDPR) and Meta's messaging policies, the system must strictly govern who receives messages.
- Explicit Opt-Ins: The database must record a timestamped, explicit opt-in consent for every user before they can be added to a broadcast list (collected via the self-service portal or during event registrations).
- Automated Opt-Outs: The system must recognize opt-out commands (e.g., a devotee replying "STOP") and automatically remove their profile from all future marketing or broadcast lists to prevent the mosque's phone number from being reported as spam.

6. Shared Team Inbox & Analytics

- As the system scales, multiple staff members will need visibility into the community's communications.
- Multi-Agent Inbox: The frontend must include a centralized, shared inbox where multiple authorized committee members can log in, read, and reply to incoming devotee messages from the single official mosque WhatsApp number.
- Actionable Analytics: The dashboard must track and display real-time campaign metrics, moving beyond just "messages sent" to show exact delivery rates, read receipts, and click-through rates on CTA buttons. This allows the mosque to measure exactly how engaged the congregation is with different announcements.
