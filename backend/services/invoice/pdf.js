import path from "path";
import { fileURLToPath } from "url";
import React from "react";
import { Document, Font, Link, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { amountInWords, formatAmount, formatIst } from "./format.js";

const h = React.createElement;
const FONT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../assets/fonts");
Font.register({
  family: "InvSans",
  fonts: [
    { src: path.join(FONT_DIR, "Carlito-Regular.ttf") },
    { src: path.join(FONT_DIR, "Carlito-Bold.ttf"), fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((w) => [w]);

/* Resume Lab palette: warm espresso panel, cream paper, orange accent. */
const PANEL = "#1c1410";
const CREAM = "#fff7ed";
const PAPER = "#fffaf5";
const INK = "#1c1410";
const MUTED = "#6b5a4e";
const SUBTLE = "#9a8778";
const BORDER = "#f0e4d8";
const BORDER_STRONG = "#dccbb9";
const ACCENT = "#ea580c";
const OK = "#15803d";
const OK_SOFT = "#eef7f1";
const PANEL_MUTED = "#c9b5a5";

const s = StyleSheet.create({
  page: { fontFamily: "InvSans", fontSize: 10.5, color: INK, lineHeight: 1.4, paddingBottom: 76 },
  band: { backgroundColor: PANEL, paddingHorizontal: 40, paddingTop: 34, paddingBottom: 30, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontSize: 30, fontWeight: 700, color: CREAM, lineHeight: 1.15 },
  brandSub: { fontSize: 10, color: PANEL_MUTED, marginTop: 3, letterSpacing: 0.5 },
  invWord: { fontSize: 11, fontWeight: 700, color: ACCENT, letterSpacing: 4, textAlign: "right" },
  invNo: { fontSize: 20, fontWeight: 700, color: CREAM, textAlign: "right", marginTop: 4, lineHeight: 1.2 },
  invDate: { fontSize: 10, color: PANEL_MUTED, textAlign: "right", marginTop: 4 },
  strip: { height: 4, backgroundColor: ACCENT },
  body: { paddingHorizontal: 40, paddingTop: 24 },
  cards: { flexDirection: "row" },
  card: { flex: 1, backgroundColor: PAPER, borderWidth: 1, borderColor: BORDER, borderRadius: 6, padding: 12 },
  gapR: { marginRight: 10 },
  label: { fontSize: 8, color: ACCENT, letterSpacing: 1.6, fontWeight: 700, marginBottom: 6 },
  name: { fontSize: 12, fontWeight: 700, marginBottom: 2 },
  line: { fontSize: 9.5, color: MUTED },
  kv: { marginBottom: 5 },
  k: { fontSize: 8, color: SUBTLE, letterSpacing: 0.6 },
  v: { fontSize: 9.5, color: INK, fontWeight: 700 },
  paid: { alignSelf: "flex-start", marginTop: 6, paddingVertical: 3, paddingHorizontal: 9, backgroundColor: OK_SOFT, color: OK, fontSize: 9, fontWeight: 700, letterSpacing: 1, borderRadius: 10, borderWidth: 1, borderColor: "#c7e3d0" },
  tHead: { flexDirection: "row", backgroundColor: PANEL, paddingVertical: 8, paddingHorizontal: 10, marginTop: 22, borderTopLeftRadius: 5, borderTopRightRadius: 5 },
  th: { color: CREAM, fontWeight: 700, fontSize: 9, letterSpacing: 1 },
  tRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: BORDER, borderLeftWidth: 1, borderLeftColor: BORDER, borderRightWidth: 1, borderRightColor: BORDER },
  cNo: { width: 26, color: SUBTLE },
  cItem: { flex: 1, paddingRight: 10 },
  cQty: { width: 36, textAlign: "right" },
  cMrp: { width: 70, textAlign: "right", color: SUBTLE, textDecoration: "line-through" },
  cUnit: { width: 74, textAlign: "right" },
  cTot: { width: 78, textAlign: "right", fontWeight: 700 },
  itemTitle: { fontWeight: 700, fontSize: 11 },
  itemSub: { fontSize: 9, color: MUTED, marginTop: 2 },
  lower: { flexDirection: "row", marginTop: 18, alignItems: "flex-start" },
  note: { flex: 1, marginRight: 18 },
  wordsBox: { backgroundColor: PAPER, borderWidth: 1, borderColor: BORDER, borderLeftWidth: 3, borderLeftColor: ACCENT, borderRadius: 4, padding: 10 },
  wordsText: { fontSize: 10.5, fontWeight: 700, marginTop: 2 },
  terms: { marginTop: 12 },
  termLine: { fontSize: 9, color: MUTED, marginBottom: 3 },
  totals: { width: 236 },
  tl: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: BORDER },
  tlK: { color: MUTED, fontSize: 10 },
  tlV: { fontSize: 10, fontWeight: 700 },
  grand: { marginTop: 8, backgroundColor: PANEL, borderRadius: 6, paddingVertical: 12, paddingHorizontal: 12 },
  grandLabel: { fontSize: 8, color: ACCENT, letterSpacing: 1.6, fontWeight: 700 },
  grandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 2 },
  grandText: { fontSize: 11, color: PANEL_MUTED },
  grandAmt: { fontSize: 21, fontWeight: 700, color: CREAM, lineHeight: 1.1 },
  thanks: { marginTop: 22, textAlign: "center", fontSize: 12, fontWeight: 700 },
  thanksSub: { textAlign: "center", fontSize: 9.5, color: MUTED, marginTop: 3 },
  foot: { position: "absolute", left: 40, right: 40, bottom: 26, borderTopWidth: 1, borderTopColor: BORDER_STRONG, paddingTop: 8, textAlign: "center", fontSize: 8.5, color: SUBTLE, lineHeight: 1.5 },
});

const money = (n) => `₹${formatAmount(n)}`;

export const buildInvoiceDoc = (inv, { refundPolicyUrl }) => {
  const seller = inv.seller || {};
  const pay = inv.payment || {};
  const mrpTotal = inv.mrpTotal || inv.subtotal;
  const rows = [["MRP", money(mrpTotal)]];
  if (mrpTotal - inv.subtotal > 0.009) rows.push(["Discount on MRP", `- ${money(mrpTotal - inv.subtotal)}`]);
  rows.push(["Price", money(inv.subtotal)]);
  if (inv.offerDiscount > 0) rows.push([inv.offerName ? `Offer (${inv.offerName})` : "Offer discount", `- ${money(inv.offerDiscount)}`]);
  if (inv.couponDiscount > 0) {
    const c = inv.coupon || {};
    const detail = c.code ? ` ${c.code}${c.discountType === "PERCENTAGE" ? ` (${c.discountValue}%)` : ""}` : "";
    rows.push([`Coupon${detail}`, `- ${money(inv.couponDiscount)}`]);
  }
  if (inv.otherDiscount > 0) rows.push(["Other discount", `- ${money(inv.otherDiscount)}`]);
  rows.push(inv.taxRate > 0 ? [`Tax included (${inv.taxRate}%)`, money(inv.taxAmount)] : ["Tax", "Nil"]);
  const saved = Math.max(mrpTotal - inv.total, 0);

  // Long ids have no spaces, so they are cut into lines by hand to stay inside the card.
  const chunks = (v, n = 26) => String(v).match(new RegExp(`.{1,${n}}`, "g")) || [];
  const kv = (k, v) =>
    v ? h(View, { style: s.kv }, h(Text, { style: s.k }, k), ...chunks(v).map((c, i) => h(Text, { key: i, style: s.v }, c))) : null;
  const info = (t) => (t ? h(Text, { style: s.line }, t) : null);

  return h(
    Document,
    { title: `Invoice ${inv.invoiceNumber}`, author: seller.name || "Target Trek", creator: seller.name || "Target Trek" },
    h(
      Page,
      { size: "A4", style: s.page },
      h(
        View,
        { style: s.band },
        h(View, null, h(Text, { style: s.brand }, seller.name || "Target Trek"), h(Text, { style: s.brandSub }, seller.website || "")),
        h(View, null, h(Text, { style: s.invWord }, "INVOICE"), h(Text, { style: s.invNo }, inv.invoiceNumber), h(Text, { style: s.invDate }, formatIst(inv.invoiceDate)))
      ),
      h(View, { style: s.strip }),
      h(
        View,
        { style: s.body },
        h(
          View,
          { style: s.cards },
          h(
            View,
            { style: [s.card, s.gapR] },
            h(Text, { style: s.label }, "BILLED TO"),
            h(Text, { style: s.name }, inv.buyer?.name || "Customer"),
            info(inv.buyer?.email),
            info(inv.buyer?.phone)
          ),
          h(
            View,
            { style: [s.card, s.gapR] },
            h(Text, { style: s.label }, "SOLD BY"),
            h(Text, { style: s.name }, seller.name || "Target Trek"),
            seller.proprietor ? info(`Proprietor: ${seller.proprietor}`) : null,
            ...(seller.addressLines || []).map((l, i) => h(Text, { key: `a${i}`, style: s.line }, l)),
            info(seller.phone ? `Phone: ${seller.phone}` : ""),
            info(seller.email),
            info(seller.pan ? `PAN: ${seller.pan}` : ""),
            info(inv.taxLine)
          ),
          h(
            View,
            { style: s.card },
            h(Text, { style: s.label }, "PAYMENT"),
            kv("ORDER ID", inv.orderId),
            kv("TRANSACTION ID", pay.paymentId || pay.transactionId),
            kv("GATEWAY", [pay.provider, pay.method && String(pay.method).toUpperCase()].filter(Boolean).join(" · ")),
            h(Text, { style: s.paid }, "PAID")
          )
        ),
        h(
          View,
          { style: s.tHead },
          h(Text, { style: [s.th, s.cNo] }, "#"),
          h(Text, { style: [s.th, s.cItem] }, "ITEM"),
          h(Text, { style: [s.th, s.cQty] }, "QTY"),
          h(Text, { style: [s.th, s.cMrp, { textDecoration: "none", color: CREAM }] }, "MRP"),
          h(Text, { style: [s.th, s.cUnit] }, "PRICE"),
          h(Text, { style: [s.th, s.cTot] }, "AMOUNT")
        ),
        ...inv.lines.map((l, i) =>
          h(
            View,
            { key: `l${i}`, style: [s.tRow, i % 2 ? { backgroundColor: PAPER } : {}], wrap: false },
            h(Text, { style: s.cNo }, String(i + 1)),
            h(View, { style: s.cItem }, h(Text, { style: s.itemTitle }, l.title), h(Text, { style: s.itemSub }, l.description || "Digital ebook (PDF), delivered electronically")),
            h(Text, { style: s.cQty }, String(l.quantity)),
            h(Text, { style: s.cMrp }, money(l.mrp || l.unitPrice)),
            h(Text, { style: s.cUnit }, money(l.unitPrice)),
            h(Text, { style: s.cTot }, money(l.total))
          )
        ),
        h(
          View,
          { style: s.lower, wrap: false },
          h(
            View,
            { style: s.note },
            h(View, { style: s.wordsBox }, h(Text, { style: s.label }, "AMOUNT IN WORDS"), h(Text, { style: s.wordsText }, amountInWords(inv.total))),
            h(
              View,
              { style: s.terms },
              h(Text, { style: s.label }, "NOTES"),
              h(Text, { style: s.termLine }, "Digital product: delivered online, nothing is shipped."),
              h(Text, { style: s.termLine }, "Prices are in Indian Rupees (INR)."),
              saved > 0 ? h(Text, { style: s.termLine }, `You saved ${money(saved)} on this order (vs MRP).`) : null
            )
          ),
          h(
            View,
            { style: s.totals },
            ...rows.map(([k, v], i) => h(View, { key: `t${i}`, style: s.tl }, h(Text, { style: s.tlK }, k), h(Text, { style: s.tlV }, v))),
            h(View, { style: s.grand }, h(Text, { style: s.grandLabel }, "TOTAL PAID"), h(View, { style: s.grandRow }, h(Text, { style: s.grandText }, "INR"), h(Text, { style: s.grandAmt }, money(inv.total))))
          )
        ),
        h(Text, { style: s.thanks }, "Thank you for learning with Target Trek!"),
        h(Text, { style: s.thanksSub }, `Questions about this invoice? Write to ${seller.email || "us"}${seller.website ? ` or visit ${seller.website}` : ""}.`)
      ),
      h(
        View,
        { style: s.foot, fixed: true },
        h(Text, null, "This is a computer-generated invoice and does not require a signature."),
        h(Text, null, "Refund policy: ", h(Link, { src: refundPolicyUrl, style: { color: ACCENT } }, refundPolicyUrl))
      )
    )
  );
};

export const renderInvoicePdf = (inv, opts) => renderToBuffer(buildInvoiceDoc(inv, opts));
