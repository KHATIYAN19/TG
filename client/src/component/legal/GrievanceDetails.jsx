import { P, Table, SUPPORT_EMAIL } from "./LegalKit.jsx";
import { BUSINESS, GRIEVANCE_OFFICER, GRIEVANCE_SLA } from "../../config/businessInfo.js";

/*
  Grievance Officer + business identity block, shared by the Privacy Policy, Terms of Service and Refund Policy.
  Values come from src/config/businessInfo.js (Vercel environment variables). Empty values are not shown.
*/
export default function GrievanceDetails() {
  const g = GRIEVANCE_OFFICER;
  const mail = (address) => (
    <a className="lg-link" href={`mailto:${address}`}>
      {address}
    </a>
  );

  const officerRows = [
    g.name && ["Name", g.name],
    ["Designation", g.designation],
    ["Email", mail(g.email)],
    g.phone && ["Phone", g.phone],
    ["Response time", `We acknowledge every complaint within ${GRIEVANCE_SLA.acknowledgeHours} hours and resolve it within ${GRIEVANCE_SLA.resolveDays} days.`],
  ].filter(Boolean);

  const businessRows = [
    BUSINESS.legalName && ["Legal name", BUSINESS.legalName],
    BUSINESS.address && ["Address", BUSINESS.address],
    BUSINESS.cin && ["CIN / LLPIN", BUSINESS.cin],
    BUSINESS.gstin && ["GSTIN", BUSINESS.gstin],
    ["Customer care", <>{mail(SUPPORT_EMAIL)}{BUSINESS.phone ? <>, {BUSINESS.phone}</> : null}</>],
  ].filter(Boolean);

  return (
    <>
      <P>
        For any complaint about our products, your order, a refund or how we handle your personal data, write to our
        Grievance Officer. Please include the email address on your account and your order ID if it is about a purchase.
      </P>
      <Table rows={officerRows} />
      <P>Target Trek is operated by:</P>
      <Table rows={businessRows} />
      <P>
        This officer is appointed under the Information Technology Act, 2000 and its rules, the Consumer Protection
        (E-Commerce) Rules, 2020 and the Digital Personal Data Protection Act, 2023.
      </P>
    </>
  );
}
