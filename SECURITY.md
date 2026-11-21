# Security

## Reporting a vulnerability

Email **supporttargettrek@gmail.com** with the subject `Security report`. Please include steps to reproduce.
Do not access other people's data, run denial-of-service tests, or publish the issue before we have fixed it.
We aim to reply within 3 working days.

## Incident response runbook (India)

When personal data may have been exposed (leaked secret, database access, account takeover, malware):

1. **Contain (first hour)**
   - Rotate the affected secrets: `MONGO_URI` password, `JWT_SECRET`, payment gateway keys, `CLOUDINARY_*`,
     AWS keys, mail provider keys. Changing `JWT_SECRET` signs everyone out (intended).
   - Revoke sessions: admin console → user → "Log out all devices", or bump every user's `tokenVersion`.
   - Preserve evidence: export Cloud Run / Cloud Logging logs and MongoDB Atlas access logs before changing more.
2. **Report to CERT-In within 6 hours** of noticing it (CERT-In Directions, 28 April 2022):
   incident@cert-in.org.in, using the form on cert-in.org.in.
3. **Notify the Data Protection Board of India and every affected user without delay** (DPDP Rules 2025, Rule 7):
   what happened, when, what data, likely consequences, what we did, what users should do, and a contact.
   Send the Board the detailed report within 72 hours.
4. **Fix the root cause**, then write a short post-incident note (timeline, cause, fix, follow-ups).

## Standing requirements

- **Log retention:** keep security-relevant logs (auth, admin actions, payments) for **180 days**, stored in India
  (CERT-In). Cloud Logging keeps only 30 days by default: set the `_Default` log bucket retention to 180 days in an
  `asia-south1` / `asia-south2` bucket.
- **Clocks:** servers must sync to NTP (Cloud Run does this automatically).
- **Secrets** live only in environment variables (Cloud Run / Vercel), never in git. `.env` files are git-ignored.
- **Admin, partner, affiliate and employee accounts** always need an emailed one-time code on a new device.
- **Content-Security-Policy:** the strict policy in `client/vercel.json` runs in report-only mode. Check the backend
  logs for `[csp]` lines, allow any legitimate origin, then rename the header to `Content-Security-Policy` to enforce it.
