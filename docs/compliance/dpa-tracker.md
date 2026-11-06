# Third-Party Data Processing Agreement (DPA) Tracker & Checklist

**Last Updated:** 26 October 2026  
**Compliance Standard:** UK GDPR Article 28  
**Status:** Action list for production onboarding (per Decision V-04, no DPAs are executed yet).

Under Article 28 of the UK GDPR, Pav Dental (Data Controller) must have executed written Data Processing Agreements (DPAs) or accepted standard data processing terms with all processors handling personal or health data.

---

## 1. Sub-Processor Inventory & Onboarding Checklist

| Processor | Purpose / Service | Data Categories Handled | Hosting / Region | DPA Mechanism | Status | Action Required |
|---|---|---|---|---|---|---|
| **Render** | Backend API hosting & background worker execution | Application runtime, environment secrets, ephemeral logs | Frankfurt, Germany (EU) | Render standard DPA / Terms of Service | **To Do** | Accept DPA upon paid production team setup |
| **Supabase** | Managed PostgreSQL database & PostGIS | Encrypted patient records, appointments, clinical charts, audit logs | Frankfurt / London | Supabase Data Processing Addendum | **To Do** | Sign/accept DPA via Supabase dashboard |
| **Upstash** | Serverless Redis (rate limiting, queue state, caching) | Session tokens, rate limit counters, temporary coordinates | Frankfurt / London | Upstash DPA | **To Do** | Accept DPA in console settings |
| **Vercel** | Marketing website & staff admin dashboard hosting | Static assets, SSR serverless functions, staff sessions | EU / Global Edge | Vercel Data Processing Addendum | **To Do** | Enable DPA acceptance in Vercel Team settings |
| **Stripe** | Payment processing & card deposit tokenization | Card tokens, billing names/addresses, transaction metadata | UK / EU / US (PCI-DSS Level 1) | Stripe Data Processing Agreement (online) | **To Do** | Accept when activating live Stripe account |
| **Daily.co** | WebRTC video consultation streams | Encrypted audio/video media streams, ephemeral room IDs | UK / EU edge; P2P encrypted | Daily DPA + Business Associate Agreement (BAA) | **To Do** | Sign DPA on production account |
| **Postmark** | Transactional email delivery | Patient emails, administrative notifications (zero diagnosis) | EU / US | ActiveCampaign / Postmark DPA | **To Do** | Accept DPA in Postmark server settings |
| **Twilio** | SMS authentication codes & staff 2FA | Phone numbers, 6-digit numeric OTPs | UK / EU routing | Twilio Data Protection Addendum | **To Do** | Accept DPA in Twilio Console |
| **Sentry** | Error reporting & diagnostics | Scrubbed stack traces (PII scrubbers enabled) | Frankfurt, Germany (EU) | Sentry DPA with Data Scrubbing Addendum | **To Do** | Accept DPA in organisation settings |
| **Expo (EAS)** | Mobile app builds & push notification delivery (APNs / FCM) | Push tokens, app binary distribution | US / Global | Expo Terms & Privacy Policy | **To Do** | Review terms when configuring EAS org |
| **postcodes.io** | UK postcode lookup and outcode coordinate resolution | Postcode / outcode query string (no patient identifiers or health data) | UK | Open API Terms / OS OpenData | **To Do** | Verify data minimisation (no patient PII submitted) |
| **Pwned Passwords** (Have I Been Pwned) | Checks a new password against known breaches at sign-up, reset and password change | The first 5 characters of the password's SHA-1 hash only (k-anonymity). No password, email or patient identifier is sent | Global (Cloudflare) | Public range API terms; no account or agreement | **To Do** | Owner to approve the transfer, or set `PASSWORD_BREACH_CHECK=off` (the check then skips the network; length and common-password rules still apply). The API fails open if unreachable |
| **Mapbox** | Road network matrix & van routing ETAs | Approximate postcodes/coordinates for route calculation | Global | Mapbox Terms of Service / DPA | **To Do** | Review upon token creation |

---

## 2. Technical Safeguards (Enforced in Code)

1. **Strict Data Minimisation in Outbound Alerts:**
   - Transactional emails (Postmark) and SMS alerts (Twilio) contain only administrative metadata (time, date, clinic address) and security codes. Clinical services and diagnosis details are never sent via SMS or email.
2. **Client-Side Card Tokenization:**
   - Payment credentials never touch Pav Dental application servers or databases; all card details are tokenised directly with Stripe.
3. **Application-Level Master Key Encryption:**
   - Sensitive clinical notes and access codes are encrypted at the application layer with AES-256-GCM using `ENCRYPTION_KEY`.
4. **Isolated Test Environments:**
   - Local and CI test suites use in-memory and synthetic fixtures (`@example.test`); external processors are mocked or stubbed out.
