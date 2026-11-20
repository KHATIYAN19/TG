/*
  Seller details printed on every invoice. Everything is read from the environment (backend/.env) so nothing is hard-coded in the
  invoice logic. Unset optional values are simply left off the PDF.

    INVOICE_SELLER_NAME        trade name                          default "Target Trek"
    INVOICE_PROPRIETOR         proprietor                          default "Lavi Kumar"
    INVOICE_SELLER_ADDRESS     postal address (use \n or | for line breaks)
    INVOICE_SELLER_EMAIL       defaults to the support address
    INVOICE_SELLER_PHONE
    INVOICE_SELLER_WEBSITE                                          default "targettrek.in"
    INVOICE_SELLER_PAN         optional
    INVOICE_SELLER_GSTIN       optional. When set, the tax line shows the GSTIN instead of "Not registered under GST"
    INVOICE_TAX_LINE           overrides the tax line text entirely
    INVOICE_TAX_RATE_PERCENT   0 by default (not GST registered). When > 0 AND a GSTIN is set, the grand total is treated as
                               tax-inclusive and the tax is shown as a breakdown line.
    INVOICE_PREFIX             default "TT"
    INVOICE_REFUND_POLICY_URL  default https://targettrek.in/refund-policy
    SEND_BOOKS_BILL            "true" = an invoice is generated automatically for every paid ebook order (it is NEVER emailed
                               automatically; an admin sends it from the transactions page). Anything else = no automatic
                               invoice at all; admins generate them by hand.
*/
const env = (name, fallback = "") => {
  const v = String(process.env[name] ?? "").trim();
  return v || fallback;
};

export const getInvoiceConfig = () => {
  const gstin = env("INVOICE_SELLER_GSTIN");
  const rate = Number(env("INVOICE_TAX_RATE_PERCENT", "0"));
  const taxRate = gstin && Number.isFinite(rate) && rate > 0 && rate < 100 ? rate : 0;
  const website = env("INVOICE_SELLER_WEBSITE", "targettrek.in");
  return {
    prefix: env("INVOICE_PREFIX", "TT").replace(/[^A-Za-z0-9]/g, "").slice(0, 8) || "TT",
    seller: {
      name: env("INVOICE_SELLER_NAME", "Target Trek"),
      proprietor: env("INVOICE_PROPRIETOR", "Lavi Kumar"),
      addressLines: env("INVOICE_SELLER_ADDRESS", "N-44, Block N, Sector 12|Noida, Uttar Pradesh 201301|India").split(/\\n|\n|\|/).map((s) => s.trim()).filter(Boolean),
      email: env("INVOICE_SELLER_EMAIL", "supporttargettrek@gmail.com"),
      phone: env("INVOICE_SELLER_PHONE"),
      website,
      pan: env("INVOICE_SELLER_PAN"),
      gstin,
    },
    taxRate,
    taxLine: env("INVOICE_TAX_LINE", gstin ? `GSTIN: ${gstin}` : "Not registered under GST"),
    refundPolicyUrl: env("INVOICE_REFUND_POLICY_URL", `https://${website.replace(/^https?:\/\//, "")}/refund-policy`),
    autoGenerate: env("SEND_BOOKS_BILL", "false").toLowerCase() === "true",
  };
};
