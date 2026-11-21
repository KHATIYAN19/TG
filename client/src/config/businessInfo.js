/*
  BUSINESS + GRIEVANCE DETAILS shown on the legal pages.

  Indian law asks the website to publish these:
    - Consumer Protection (E-Commerce) Rules 2020, Rule 4: legal name, address, customer-care contact and the
      Grievance Officer's name, designation and contact. Complaints acknowledged in 48 hours, resolved in 1 month.
    - IT Act 2000 s.43A + SPDI Rules 2011 (Rule 5(9)), Intermediary Rules 2021, DPDP Act 2023 s.8(9)/s.13: a named
      person who answers questions about personal data and handles grievances.

  Set the real values as Vercel environment variables (Project → Settings → Environment Variables) and redeploy.
  Use the SAME legal name / address / GSTIN as the backend's INVOICE_SELLER_* settings so invoices and the website
  match. Anything left empty is simply not shown.
*/

const env = (key) => String(import.meta.env[key] || "").trim();

export const BUSINESS = {
  legalName: env("VITE_LEGAL_NAME"), // e.g. "Target Trek Learning Pvt. Ltd." or "<Proprietor name> (Target Trek)"
  address: env("VITE_LEGAL_ADDRESS"), // full registered / principal place of business address
  gstin: env("VITE_LEGAL_GSTIN"), // optional
  cin: env("VITE_LEGAL_CIN"), // only for a company / LLP (CIN or LLPIN)
  phone: env("VITE_SUPPORT_PHONE"), // customer-care number (optional but recommended)
};

export const GRIEVANCE_OFFICER = {
  name: env("VITE_GRIEVANCE_OFFICER_NAME"),
  designation: env("VITE_GRIEVANCE_OFFICER_DESIGNATION") || "Grievance Officer",
  email: env("VITE_GRIEVANCE_OFFICER_EMAIL") || "supporttargettrek@gmail.com",
  phone: env("VITE_GRIEVANCE_OFFICER_PHONE"),
};

/* Statutory response times for complaints (E-Commerce Rules 2020, Rule 4(5)). */
export const GRIEVANCE_SLA = {
  acknowledgeHours: 48,
  resolveDays: 30,
};

export const isBusinessInfoComplete = () =>
  Boolean(BUSINESS.legalName && BUSINESS.address && GRIEVANCE_OFFICER.name);
