
import sendMail from "../utils/MailSender.js";

const BRAND = "Target Trek";
const SITE_URL = "https://www.targettrek.in";

const SUPPORT_EMAIL =
  "supporttargettrek@gmail.com";

const ADMIN_EMAIL =
  process.env.ADMIN_MAIL;

const TIMEZONE = "Asia/Kolkata";

const CANCELLATION_FEE = 199;

const ORANGE = "#ea580c";
const DARK_ORANGE = "#c2410c";
const TEXT = "#292524";
const MUTED = "#78716c";

const TOPICS = {
  DSA: "Data Structures & Algorithms",
  LLD: "Low-Level Design",
  HLD: "High-Level System Design",
  GENAI: "Generative AI / AI Engineering",
  PROJECTS: "Project Discussion",
};

/* =====================================================
   SAFE TEXT AND FORMATTING
===================================================== */

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]
  );

const stringValue = (value, fallback = "—") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};

const formatDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);
};

const formatTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      timeZone: TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  ).format(date);
};

const formatDateTime = (value) =>
  `${formatDate(value)} at ${formatTime(value)} IST`;

const money = (amount) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(amount) || 0);

const roundMoney = (value) =>
  Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;

/* =====================================================
   MEETING LINK VALIDATION

   Do not put untrusted or invalid schemes
   in clickable email links.
===================================================== */

function safeUrl(value) {
  if (!value) return null;

  try {
    const url = new URL(
      String(value).trim()
    );

    if (url.protocol !== "https:") {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

/* =====================================================
   BOOKING DATA

   Uses your existing InterviewBooking model.
===================================================== */

function getDetails(booking) {
  if (
    !booking?.bookingId ||
    !booking?.candidate ||
    !booking?.slotSnapshot
  ) {
    throw new Error(
      "Incomplete interview booking details"
    );
  }

  const snapshot = booking.slotSnapshot;

  const start = new Date(
    snapshot.startTime
  );

  if (
    Number.isNaN(start.getTime())
  ) {
    throw new Error(
      "Invalid interview start time"
    );
  }

  const end = snapshot.endTime
    ? new Date(snapshot.endTime)
    : new Date(
        start.getTime() +
          Number(snapshot.durationMinutes || 45) *
            60000
      );

  if (
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    throw new Error(
      "Invalid interview end time"
    );
  }

  const meetingUrl = safeUrl(
    booking.meeting?.url ||
      booking.meetingUrl
  );

  const selectedTopics = Array.isArray(
    booking.selectedTopics
  )
    ? booking.selectedTopics.map(
        (topic) =>
          TOPICS[topic] || topic
      )
    : [];

  return {
    bookingId: String(
      booking.bookingId
    ),
    name: stringValue(
      booking.candidate.name
    ),
    email: stringValue(
      booking.candidate.email
    ),
    phone: stringValue(
      booking.candidate.phone
    ),
    experience: booking.candidate.experienceYears,
    currentRole: stringValue(
      booking.candidate.currentRole
    ),
    targetRole: stringValue(
      booking.candidate.targetRole
    ),
    notes: stringValue(
      booking.candidate.notes,
      "None"
    ),
    resumeUrl: safeUrl(
      booking.candidate.resumeUrl
    ),
    title: stringValue(
      snapshot.title,
      "1:1 Technical Mock Interview"
    ),
    start,
    end,
    durationMinutes:
      snapshot.durationMinutes ||
      Math.round(
        (end - start) / 60000
      ),
    topics: selectedTopics,
    amount: roundMoney(
      snapshot.price
    ),
    meetingUrl,
    paymentStatus: stringValue(
      booking.payment?.status,
      "UNKNOWN"
    ),
    paymentOrderId: stringValue(
      booking.payment?.gatewayOrderId
    ),
    refundStatus: stringValue(
      booking.refund?.status,
      "NOT_REQUESTED"
    ),
  };
}

/* =====================================================
   ICS HELPERS

   UID remains identical between booking
   confirmation and cancellation.

   Calendar apps use the same UID to identify
   which event must be removed.
===================================================== */

function icsTimestamp(value) {
  return new Date(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function icsEscape(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldIcsLine(line) {
  // RFC 5545 recommends line folding at 75 octets.
  // Keep each physical line at most 75 UTF-8 bytes.
  const pieces = [];
  let current = "";

  for (const char of line) {
    const prefix = pieces.length ? " " : "";
    const limit = 75 - Buffer.byteLength(prefix);
    if (
      current &&
      Buffer.byteLength(current + char, "utf8") > limit
    ) {
      pieces.push(current);
      current = char;
    } else {
      current += char;
    }
  }

  if (current) pieces.push(current);

  return pieces
    .map((piece, index) =>
      index ? ` ${piece}` : piece
    )
    .join("\r\n");
}

function calendarUid(bookingId) {
  const safeId = String(bookingId)
    .replace(/[^A-Za-z0-9_-]/g, "");

  return `${safeId}@targettrek.in`;
}

function createCalendarFile(
  details,
  {
    cancelled = false,
    reason = "",
    sequence = 0,
  } = {}
) {
  const description = [
    "Target Trek 1:1 Mock Interview",
    `Booking: ${details.bookingId}`,
    `Topics: ${details.topics.join(", ")}`,
    `Support: ${SUPPORT_EMAIL}`,
    details.meetingUrl
      ? `Join: ${details.meetingUrl}`
      : "Meeting details will be shared separately.",
    cancelled
      ? `Cancelled: ${reason}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Target Trek//Mock Interviews//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${cancelled ? "CANCEL" : "REQUEST"}`,
    "BEGIN:VEVENT",
    `UID:${calendarUid(details.bookingId)}`,
    `DTSTAMP:${icsTimestamp(new Date())}`,
    `DTSTART:${icsTimestamp(details.start)}`,
    `DTEND:${icsTimestamp(details.end)}`,
    `SEQUENCE:${Math.max(0, Number(sequence) || 0)}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    `SUMMARY:${icsEscape(
      `${details.title} | Target Trek`
    )}`,
    `DESCRIPTION:${icsEscape(description)}`,
    `ORGANIZER;CN=Target Trek:mailto:no-reply@targettrek.in`,
    `ATTENDEE;CN=${icsEscape(
      details.name
    )};RSVP=FALSE:mailto:${details.email}`,
    details.meetingUrl
      ? `LOCATION:${icsEscape(details.meetingUrl)}`
      : "LOCATION:Online",
    ...(cancelled
      ? []
      : [
          "BEGIN:VALARM",
          "TRIGGER:-PT15M",
          "ACTION:DISPLAY",
          "DESCRIPTION:Target Trek interview starts in 15 minutes",
          "END:VALARM",
        ]),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return (
    lines.map(foldIcsLine).join("\r\n") +
    "\r\n"
  );
}

/* =====================================================
   CALENDAR LINKS

   Dates are UTC.
   Calendar services display their local zone.

   Use add links only for confirmed bookings.
===================================================== */

function calendarLinks(details) {
  const start = icsTimestamp(
    details.start
  );

  const end = icsTimestamp(
    details.end
  );

  const title =
    `${details.title} | Target Trek`;

  const description = [
    `Booking ID: ${details.bookingId}`,
    `Topics: ${details.topics.join(", ")}`,
    `Support: ${SUPPORT_EMAIL}`,
  ].join("\n");

  const location =
    details.meetingUrl ||
    "Online interview";

  const google = new URL(
    "https://calendar.google.com/calendar/render"
  );

  google.searchParams.set(
    "action",
    "TEMPLATE"
  );
  google.searchParams.set(
    "text",
    title
  );
  google.searchParams.set(
    "dates",
    `${start}/${end}`
  );
  google.searchParams.set(
    "details",
    description
  );
  google.searchParams.set(
    "location",
    location
  );
  google.searchParams.set(
    "ctz",
    TIMEZONE
  );

  const outlook = new URL(
    "https://outlook.office.com/calendar/0/deeplink/compose"
  );

  outlook.searchParams.set(
    "path",
    "/calendar/action/compose"
  );
  outlook.searchParams.set(
    "rru",
    "addevent"
  );
  outlook.searchParams.set(
    "subject",
    title
  );
  outlook.searchParams.set(
    "startdt",
    details.start.toISOString()
  );
  outlook.searchParams.set(
    "enddt",
    details.end.toISOString()
  );
  outlook.searchParams.set(
    "body",
    description
  );
  outlook.searchParams.set(
    "location",
    location
  );

  return {
    google: google.toString(),
    outlook: outlook.toString(),
  };
}

/* =====================================================
   EMAIL PRESENTATION HELPERS
===================================================== */

function detailRow(label, value) {
  return `
    <tr>
      <td
        style="padding:12px 14px;
          border-bottom:1px solid #f3e7dc;
          color:#78716c;font-size:13px;
          width:37%;vertical-align:top;">
        ${escapeHtml(label)}
      </td>

      <td
        style="padding:12px 14px;
          border-bottom:1px solid #f3e7dc;
          font-size:13px;font-weight:700;
          color:#292524;vertical-align:top;
          overflow-wrap:anywhere;">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function sectionHeading(title) {
  return `
    <h3 style="
      margin:28px 0 12px;
      color:#292524;
      font-size:17px;
      line-height:1.4;
      font-weight:800;">
      ${escapeHtml(title)}
    </h3>
  `;
}

function infoBox(
  content,
  background = "#fff7ed",
  border = "#fed7aa"
) {
  return `
    <div style="
      background:${background};
      border:1px solid ${border};
      border-radius:12px;
      padding:17px 18px;
      margin:20px 0;
      font-size:13px;
      line-height:1.8;">
      ${content}
    </div>
  `;
}

function button(label, url, secondary = false) {
  const safe = safeUrl(url);

  if (!safe) return "";

  return `
    <a href="${escapeHtml(safe)}"
      target="_blank"
      rel="noopener noreferrer"
      style="
        display:inline-block;
        background:${secondary ? "#ffffff" : ORANGE};
        color:${secondary ? DARK_ORANGE : "#ffffff"};
        border:1px solid ${
          secondary ? "#fed7aa" : ORANGE
        };
        border-radius:9px;
        padding:13px 19px;
        margin:5px 6px 5px 0;
        font-size:13px;
        font-weight:800;
        text-decoration:none;">
      ${escapeHtml(label)}
    </a>
  `;
}

/* =====================================================
   EMAIL WRAPPER
===================================================== */

function emailTemplate({
  eyebrow,
  title,
  subtitle,
  content,
}) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport"
    content="width=device-width,initial-scale=1"/>

  <title>${escapeHtml(title)}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#fff7ed;
  font-family:Arial,Helvetica,sans-serif;
  color:#292524;">

  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;">
    ${escapeHtml(subtitle)}
  </div>

  <table role="presentation"
    cellpadding="0" cellspacing="0"
    width="100%"
    style="background:#fff7ed;">

    <tr>
      <td align="center"
        style="padding:30px 12px;">

        <table role="presentation"
          cellpadding="0" cellspacing="0"
          width="100%"
          style="
            max-width:640px;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #fed7aa;">

          <tr>
            <td style="
              padding:27px 30px;
              background:${ORANGE};
              color:#ffffff;">

              <div style="
                font-size:24px;
                font-weight:900;
                letter-spacing:-.7px;">
                TARGET TREK
              </div>

              <div style="
                font-size:11px;
                letter-spacing:2px;
                text-transform:uppercase;
                margin-top:9px;
                color:#ffedd5;
                font-weight:700;">
                ${escapeHtml(eyebrow)}
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:28px 27px 30px;">

              <h1 style="
                font-size:25px;
                line-height:1.25;
                letter-spacing:-.5px;
                margin:0 0 12px;
                color:#292524;">
                ${escapeHtml(title)}
              </h1>

              <p style="
                color:#78716c;
                font-size:14px;
                line-height:1.8;
                margin:0 0 24px;">
                ${escapeHtml(subtitle)}
              </p>

              ${content}

              <div style="
                margin-top:34px;
                padding-top:22px;
                border-top:1px solid #f3e7dc;">

                <p style="
                  font-size:12px;
                  color:#78716c;
                  line-height:1.9;
                  margin:0;">
                  Need help? Contact
                  <a href="mailto:${SUPPORT_EMAIL}"
                    style="color:${DARK_ORANGE};
                      text-decoration:none;
                      font-weight:700;">
                    ${SUPPORT_EMAIL}
                  </a>
                </p>

                <p style="
                  color:#78716c;
                  font-size:12px;
                  line-height:1.8;
                  margin:10px 0 0;">
                  This is a transactional email from
                  ${BRAND} regarding your mock
                  interview booking.
                </p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="
              padding:20px 25px;
              text-align:center;
              background:#fff7ed;">

              <a href="${SITE_URL}"
                style="
                  color:${DARK_ORANGE};
                  text-decoration:none;
                  font-size:12px;
                  font-weight:800;">
                www.targettrek.in
              </a>

              <p style="
                margin:9px 0 0;
                font-size:11px;
                color:#a8a29e;">
                © ${new Date().getFullYear()} Target Trek
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* =====================================================
   BOOKING DETAILS TABLE
===================================================== */

function bookingDetailsTable(details, { admin = false } = {}) {
  const rows = [
    ["Booking ID", details.bookingId],
    ["Interview", details.title],
    ["Date", formatDate(details.start)],
    [
      "Time",
      `${formatTime(details.start)} – ${formatTime(
        details.end
      )} IST`,
    ],
    [
      "Duration",
      `${details.durationMinutes} minutes`,
    ],
    [
      "Selected topics",
      details.topics.join(", ") || "—",
    ],
    ["Candidate name", details.name],
    ["Email", details.email],
    ["Phone", details.phone],
    [
      "Experience",
      details.experience === undefined ||
      details.experience === null
        ? "Not specified"
        : `${details.experience} years`,
    ],
    [
      "Current role",
      details.currentRole,
    ],
    [
      "Target role",
      details.targetRole,
    ],
    [
      "Amount paid",
      money(details.amount),
    ],
    [
      "Payment status",
      details.paymentStatus,
    ],
  ];

  if (admin) {
    rows.push(
      [
        "Gateway order",
        details.paymentOrderId,
      ],
      [
        "Candidate notes",
        details.notes,
      ],
      [
        "Resume URL",
        details.resumeUrl || "Not provided",
      ]
    );
  }

  return `
    <table role="presentation"
      cellpadding="0" cellspacing="0"
      width="100%"
      style="
        width:100%;
        border-collapse:collapse;
        border:1px solid #f3e7dc;
        border-radius:12px;">
      ${rows
        .map(([label, value]) =>
          detailRow(label, value)
        )
        .join("")}
    </table>
  `;
}

/* =====================================================
   MEETING LINK SECTION
===================================================== */

function meetingSection(details) {
  if (!details.meetingUrl) {
    return infoBox(`
      <strong style="color:${DARK_ORANGE};">
        Meeting link will be shared separately
      </strong>

      <p style="margin:7px 0 0;">
        Your booking is confirmed.
        The joining link has not yet been assigned.
        Please check your email for an update
        before your scheduled interview.
      </p>
    `);
  }

  return `
    ${sectionHeading("Your interview joining link")}

    ${infoBox(`
      <strong style="color:${DARK_ORANGE};">
        Online interview
      </strong>

      <p style="margin:8px 0;
        overflow-wrap:anywhere;">
        ${escapeHtml(details.meetingUrl)}
      </p>

      ${button(
        "Join Your Interview",
        details.meetingUrl
      )}
    `)}

    <p style="
      font-size:12px;
      color:#78716c;
      line-height:1.7;">
      Please join 5 minutes early and
      check your internet, microphone
      and camera before the session.
    </p>
  `;
}

/* =====================================================
   CALENDAR SECTION
===================================================== */

function calendarSection(details) {
  const links = calendarLinks(details);

  return `
    ${sectionHeading("Add this interview to your calendar")}

    <p style="
      color:#78716c;
      font-size:13px;
      line-height:1.8;">
      Save the session so you do not miss it.
      Times are shown in Indian Standard Time.
    </p>

    <div style="margin-top:8px;">
      ${button(
        "Google Calendar",
        links.google
      )}

      ${button(
        "Outlook Calendar",
        links.outlook,
        true
      )}
    </div>

    ${infoBox(`
      <strong>Apple Calendar or other apps</strong>

      <p style="margin:7px 0 0;">
        An interview calendar invitation
        (.ics file) is also attached
        to this email.
        Open the attachment to add the session
        to a compatible calendar app.
      </p>
    `)}
  `;
}

/* =====================================================
   CANCELLATION POLICY
===================================================== */

function cancellationPolicySection() {
  return `
    ${sectionHeading("Cancellation & refund policy")}

    ${infoBox(`
      <p style="margin:0 0 10px;">
        <strong>Candidate-requested cancellation:</strong>
        A one-time cancellation charge of
        <strong>${money(CANCELLATION_FEE)}</strong>
        applies to the booking.
      </p>

      <p style="margin:0 0 10px;">
        <strong>Cancellation by Target Trek:</strong>
        If Target Trek cancels your session
        for an administrative or operational
        reason, you will receive a
        <strong>full refund without a cancellation fee</strong>.
      </p>

      <p style="margin:0 0 10px;">
        Approved refunds are returned to
        the original payment method,
        generally within
        <strong>7 business days after successful
        refund initiation</strong>,
        subject to payment-provider and bank processing.
      </p>

      <p style="margin:0;">
        To request cancellation, email
        <a href="mailto:${SUPPORT_EMAIL}"
          style="color:${DARK_ORANGE};font-weight:800;">
          ${SUPPORT_EMAIL}
        </a>
        with your booking ID and the reason.
      </p>
    `)}
  `;
}

/* =====================================================
   PLAIN TEXT BOOKING DETAILS
===================================================== */

function bookingDetailsText(details) {
  return [
    `Booking ID: ${details.bookingId}`,
    `Interview: ${details.title}`,
    `Date: ${formatDate(details.start)}`,
    `Time: ${formatTime(details.start)} - ${formatTime(details.end)} IST`,
    `Duration: ${details.durationMinutes} minutes`,
    `Topics: ${details.topics.join(", ")}`,
    `Candidate: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,
    `Amount: ${money(details.amount)}`,
    `Payment: ${details.paymentStatus}`,
    `Meeting URL: ${details.meetingUrl || "To be shared"}`,
  ].join("\n");
}

/* =====================================================
   CANDIDATE-FIRST / ADMIN-SECOND DELIVERY

   Candidate failure is reported, then admin
   email is attempted after it.

   Both failures are returned to the caller.

   Do not roll back paid bookings for mail errors.
===================================================== */

async function sendCandidateThenAdmin({
  candidateEmail,
  candidateSubject,
  candidateText,
  candidateHtml,
  candidateOptions = {},
  adminSubject,
  adminText,
  adminHtml,
  adminOptions = {},
}) {
  const results = [];

  try {
    const candidateInfo = await sendMail(
      candidateEmail,
      candidateSubject,
      candidateText,
      candidateHtml,
      {
        replyTo: SUPPORT_EMAIL,
        ...candidateOptions,
      }
    );

    results.push({
      status: "fulfilled",
      value: candidateInfo,
    });
  } catch (error) {
    results.push({
      status: "rejected",
      reason: error,
    });
  }

  if (ADMIN_EMAIL) {
    try {
      const adminInfo = await sendMail(
        ADMIN_EMAIL,
        adminSubject,
        adminText,
        adminHtml,
        {
          replyTo: SUPPORT_EMAIL,
          ...adminOptions,
        }
      );

      results.push({
        status: "fulfilled",
        value: adminInfo,
      });
    } catch (error) {
      results.push({
        status: "rejected",
        reason: error,
      });
    }
  } else {
    console.warn(
      "[INTERVIEW EMAIL] ADMIN_MAIL is not configured"
    );

    results.push({
      status: "rejected",
      reason: new Error(
        "ADMIN_MAIL not configured"
      ),
    });
  }

  return results;
}

/* =====================================================
   BOOKING CONFIRMATION

   Invoke only after verified successful payment.

   Meeting link may be preconfigured or assigned
   later. Do not fail confirmation when absent.
===================================================== */

export async function sendInterviewConfirmation(booking) {
  if (
    booking.status !== "CONFIRMED" ||
    booking.payment?.status !== "SUCCESS"
  ) {
    throw new Error(
      "Cannot send confirmation for an unconfirmed payment"
    );
  }

  const details = getDetails(booking);

  const candidateHtml = emailTemplate({
    eyebrow: "Booking Confirmed",
    title: "Your interview is confirmed!",
    subtitle:
      "Your payment was successful and your mock interview is booked.",
    content: `
      <p style="font-size:14px;line-height:1.9;">
        Hi <strong>${escapeHtml(details.name)}</strong>,
      </p>

      <p style="font-size:14px;line-height:1.9;">
        Thank you for booking your mock interview
        with <strong>Target Trek</strong>.
        Your session is confirmed.
        Below are all the details you need
        to prepare and join.
      </p>

      ${infoBox(`
        <div style="
          font-size:12px;
          font-weight:800;
          color:${DARK_ORANGE};
          letter-spacing:1px;">
          YOUR INTERVIEW
        </div>

        <div style="
          font-size:20px;
          font-weight:900;
          margin-top:7px;">
          ${escapeHtml(formatDate(details.start))}
        </div>

        <div style="
          font-size:17px;
          font-weight:800;
          margin-top:5px;">
          ${escapeHtml(formatTime(details.start))}
          –
          ${escapeHtml(formatTime(details.end))}
          IST
        </div>

        <div style="margin-top:9px;color:${MUTED};">
          ${details.durationMinutes} minutes ·
          Online · 1:1 Mock Interview
        </div>
      `)}

      ${sectionHeading("Booking & payment details")}

      ${bookingDetailsTable(details)}

      ${meetingSection(details)}

      ${calendarSection(details)}

      ${sectionHeading("Before your interview")}

      <p style="font-size:13px;line-height:1.9;">
        • Join at least 5 minutes early.<br/>
        • Use a stable internet connection.<br/>
        • Check your camera and microphone.<br/>
        • Keep your resume and project notes ready.<br/>
        • Be prepared to discuss your selected topics.
      </p>

      ${cancellationPolicySection()}

      <p style="
        margin-top:25px;
        font-size:14px;
        line-height:1.8;">
        We look forward to your session!<br/>
        <strong>Team Target Trek</strong>
      </p>
    `,
  });

  const adminHtml = emailTemplate({
    eyebrow: "Admin Notification",
    title: "New paid interview booking",
    subtitle:
      "A candidate has completed payment and reserved an interview slot.",
    content: `
      ${infoBox(`
        <strong style="color:${DARK_ORANGE};">
          Payment verified
        </strong>

        <p style="margin:7px 0 0;">
          Booking ID:
          <strong>${escapeHtml(details.bookingId)}</strong>
        </p>
      `)}

      ${sectionHeading("Interview information")}

      ${bookingDetailsTable(details, {
        admin: true,
      })}

      ${sectionHeading("Meeting details")}

      ${
        details.meetingUrl
          ? button(
              "Open Meeting",
              details.meetingUrl
            )
          : infoBox(
              "No meeting link has been assigned yet. Add the joining link and notify the candidate."
            )
      }

      ${sectionHeading("Administrative checklist")}

      <p style="font-size:13px;line-height:1.9;">
        • Verify the assigned interviewer.<br/>
        • Check the candidate's selected topics.<br/>
        • Review candidate notes and resume.<br/>
        • Ensure the meeting link is ready.<br/>
        • Conduct the session at the scheduled time.
      </p>
    `,
  });

  const links = calendarLinks(details);

  const candidateText = `
Hi ${details.name},

Your Target Trek mock interview is confirmed.

${bookingDetailsText(details)}

Add to Google Calendar:
${links.google}

Add to Outlook Calendar:
${links.outlook}

You can also open the attached .ics file.

Cancellation:
Email ${SUPPORT_EMAIL} with your booking ID.
Candidate-requested cancellation fee: ${money(CANCELLATION_FEE)}.
Admin-initiated cancellation: full refund to original payment method,
generally within 7 business days after successful refund initiation.

Team Target Trek
  `.trim();

  const adminText = `
New paid interview booking.

${bookingDetailsText(details)}

Candidate notes: ${details.notes}
Resume: ${details.resumeUrl || "Not provided"}
  `.trim();

  const calendarFile = createCalendarFile(
    details
  );

  return sendCandidateThenAdmin({
    candidateEmail: details.email,

    candidateSubject:
      `Interview Confirmed | ${formatDate(details.start)} | ${details.bookingId}`,

    candidateText,
    candidateHtml,

    candidateOptions: {
      attachments: [
        {
          filename:
            `TargetTrek-${details.bookingId}.ics`,
          content: calendarFile,
          contentType: "text/calendar; method=REQUEST; charset=UTF-8",
        },
      ],
    },

    adminSubject:
      `New Paid Interview Booking | ${details.bookingId}`,

    adminText,
    adminHtml,
  });
}

/* =====================================================
   CANCELLATION REFUND CALCULATION

   IMPORTANT:
   Expected refund is a policy calculation.

   Actual refund must be taken from booking.refund
   when the backend has finalized the refund amount.

   Never say "refunded" unless refund.status
   is SUCCESS.
===================================================== */

function calculateCancellation(booking, details) {
  const cancelledByRole = String(
    booking.cancellation?.cancelledByRole ||
      ""
  ).toUpperCase();

  const isAdminCancellation =
    ["ADMIN", "EMPLOYEE", "SYSTEM"].includes(
      cancelledByRole
    );

  const paid =
    booking.payment?.status === "SUCCESS";

  const paidAmount = paid
    ? details.amount
    : 0;

  const policyFee = isAdminCancellation
    ? 0
    : Math.min(CANCELLATION_FEE, paidAmount);

  const policyRefundAmount = roundMoney(
    Math.max(0, paidAmount - policyFee)
  );

  /*
    The refund stored in MongoDB takes priority
    over our policy estimate.

    A refund must never exceed what the user paid.
  */

  const storedRefundAmount =
    booking.refund?.amount;

  const hasStoredRefundAmount =
    storedRefundAmount !== null &&
    storedRefundAmount !== undefined &&
    Number.isFinite(
      Number(storedRefundAmount)
    );

  const refundAmount =
    hasStoredRefundAmount
      ? roundMoney(
          Math.max(
            0,
            Math.min(
              paidAmount,
              Number(storedRefundAmount)
            )
          )
        )
      : policyRefundAmount;

  const fee = roundMoney(
    Math.max(0, paidAmount - refundAmount)
  );

  const refundStatus = String(
    booking.refund?.status ||
      (paid ? "NOT_INITIATED" : "NOT_APPLICABLE")
  ).toUpperCase();

  const reason = stringValue(
    booking.cancellation?.reason,
    "No reason specified"
  );

  return {
    cancelledByRole,
    isAdminCancellation,
    paid,
    paidAmount,
    fee,
    refundAmount,
    refundStatus,
    reason,
    refundId: stringValue(
      booking.refund?.gatewayRefundId,
      "Not assigned"
    ),
    initiatedAt:
      booking.refund?.initiatedAt || null,
    completedAt:
      booking.refund?.completedAt ||
      booking.refund?.refundedAt ||
      null,
  };
}

/* =====================================================
   REFUND STATUS DESCRIPTION
===================================================== */

function refundStatusDescription(info) {
  if (!info.paid) {
    return "No successful payment was recorded for this booking, so no refund is due.";
  }

  switch (info.refundStatus) {
    case "SUCCESS":
      return "The refund has been marked successful by the payment provider. The credit should appear on the original payment method according to bank processing timelines.";

    case "PROCESSING":
    case "PENDING":
    case "ONHOLD":
      return "Your refund request is pending or processing. This does not mean the refund is completed. Once successfully initiated, the target credit timeline is within 7 business days, subject to gateway and bank processing.";

    case "FAILED":
      return "The refund attempt was unsuccessful. Please contact support with your booking ID so the refund can be reviewed.";

    default:
      return "Refund initiation has not yet been confirmed. Our support team will review the eligible refund amount and payment status.";
  }
}

/* =====================================================
   REFUND DETAILS TABLE
===================================================== */

function refundDetailsTable(info) {
  return `
    <table role="presentation"
      cellpadding="0" cellspacing="0"
      width="100%"
      style="
        border-collapse:collapse;
        border:1px solid #f3e7dc;">

      ${detailRow(
        "Amount paid",
        money(info.paidAmount)
      )}

      ${detailRow(
        "Cancellation fee",
        money(info.fee)
      )}

      ${detailRow(
        "Refund amount",
        money(info.refundAmount)
      )}

      ${detailRow(
        "Refund status",
        info.refundStatus
      )}

      ${detailRow(
        "Refund reference",
        info.refundId
      )}

      ${detailRow(
        "Refund destination",
        "Original payment method"
      )}

      ${info.initiatedAt
        ? detailRow(
            "Refund initiated",
            formatDateTime(info.initiatedAt)
          )
        : ""}

      ${info.completedAt
        ? detailRow(
            "Refund completed",
            formatDateTime(info.completedAt)
          )
        : ""}

    </table>
  `;
}


/* =========================================================
   TARGET TREK - INTERVIEW CANCELLATION EMAIL

   Candidate email:
   - Cancellation confirmation
   - Booking information
   - Simple refund message
   - Actual eligible refund amount
   - 5-7 business day timeline
   - Candidate cancellation fee or admin full refund
   - Calendar cancellation attachment

   Admin email:
   - Full cancellation information
   - Internal refund details
   - Follow-up actions

   Candidate email is sent first.
   Admin email is sent second.
========================================================= */

export async function sendInterviewCancellation(booking) {
  if (!booking) {
    throw new Error("Interview booking is required");
  }

  const details = getDetails(booking);

  const info = calculateCancellation(
    booking,
    details
  );

  const cancelledBy = info.isAdminCancellation
    ? "Target Trek"
    : "Candidate";

  const refundableAmount = money(
    info.refundAmount
  );

  const paidAmount = money(
    info.paidAmount
  );

  const cancelledByCandidate =
    !info.isAdminCancellation;

  /* =====================================================
     REFUND MESSAGE

     Use the amount already calculated from the
     booking's stored refund data.

     Do not claim the money has been refunded
     merely because cancellation succeeded.
  ===================================================== */

  let refundMessageHtml = "";
  let refundMessageText = "";

  if (!info.paid) {
    refundMessageHtml = `
      <p style="
        margin:0;
        font-size:14px;
        line-height:1.9;
        color:${TEXT};
      ">
        No successful payment was recorded
        for this booking, so no refund is due.
      </p>
    `;

    refundMessageText =
      "No successful payment was recorded for this booking, so no refund is due.";

  } else {
    const feeMessageHtml = cancelledByCandidate
      ? `
        <p style="
          margin:12px 0 0;
          color:${MUTED};
          font-size:13px;
          line-height:1.8;
        ">
          As this cancellation was requested by
          you, the applicable cancellation fee
          has been deducted from the refundable
          amount.
        </p>
      `
      : `
        <p style="
          margin:12px 0 0;
          color:${MUTED};
          font-size:13px;
          line-height:1.8;
        ">
          Since Target Trek cancelled your
          interview, no cancellation fee
          applies and you are eligible for
          a full refund.
        </p>
      `;

    const refundTimingHtml =
      info.refundStatus === "SUCCESS"
        ? `
          <p style="
            margin:12px 0 0;
            font-size:13px;
            line-height:1.8;
            color:${MUTED};
          ">
            Your refund has been marked
            successful by the payment provider.
            The credit may take additional time
            to appear in your original payment
            method.
          </p>
        `
        : info.refundStatus === "FAILED"
          ? `
            <p style="
              margin:12px 0 0;
              font-size:13px;
              line-height:1.8;
              color:${MUTED};
            ">
              Your refund requires further
              review. Please contact our support
              team with your booking ID.
            </p>
          `
          : info.refundAmount > 0
            ? `
              <p style="
                margin:12px 0 0;
                font-size:13px;
                line-height:1.8;
                color:${MUTED};
              ">
                Your eligible refund will be
                processed to the original payment
                method. The expected credit
                timeline is
                <strong>5–7 business days</strong>
                after successful refund
                initiation, subject to payment
                provider and bank processing.
              </p>
            `
            : "";

    refundMessageHtml = `
      <div style="
        font-size:12px;
        font-weight:800;
        color:${DARK_ORANGE};
        letter-spacing:1px;
        text-transform:uppercase;
      ">
        Your refund amount
      </div>

      <div style="
        margin-top:9px;
        font-size:29px;
        font-weight:900;
        line-height:1.2;
        color:${TEXT};
      ">
        ${escapeHtml(refundableAmount)}
      </div>

      ${feeMessageHtml}

      ${refundTimingHtml}
    `;

    refundMessageText = [
      `Your refund amount: ${refundableAmount}`,
      cancelledByCandidate
        ? "The applicable candidate-requested cancellation fee has been deducted from this amount."
        : "Target Trek cancelled your interview. No cancellation fee applies, and you are eligible for a full refund.",
      info.refundStatus === "SUCCESS"
        ? "The payment provider has marked your refund successful. Bank credit may take additional time."
        : info.refundStatus === "FAILED"
          ? "Your refund requires review. Please contact support."
          : info.refundAmount > 0
            ? "Your refund is expected within 5-7 business days after successful refund initiation, subject to payment-provider and bank processing."
            : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  /* =====================================================
     CANDIDATE EMAIL HTML
  ===================================================== */

  const candidateHtml = emailTemplate({
    eyebrow: "Booking Cancelled",
    title: "Your interview has been cancelled",
    subtitle:
      "Your Target Trek mock interview cancellation has been confirmed.",

    content: `
      <p style="
        font-size:14px;
        line-height:1.9;
        color:${TEXT};
      ">
        Hi <strong>${escapeHtml(details.name)}</strong>,
      </p>

      <p style="
        font-size:14px;
        line-height:1.9;
        color:${TEXT};
      ">
        We're writing to confirm that your
        mock interview booking with
        <strong>Target Trek</strong>
        has been cancelled.
      </p>

      ${infoBox(`
        <div style="
          font-size:12px;
          font-weight:800;
          color:${DARK_ORANGE};
          letter-spacing:1px;
        ">
          INTERVIEW CANCELLED
        </div>

        <div style="
          font-size:19px;
          font-weight:900;
          margin-top:9px;
          color:${TEXT};
        ">
          ${escapeHtml(formatDate(details.start))}
        </div>

        <div style="
          font-size:15px;
          font-weight:700;
          margin-top:6px;
        ">
          ${escapeHtml(formatTime(details.start))}
          –
          ${escapeHtml(formatTime(details.end))}
          IST
        </div>
      `)}

      ${sectionHeading("Cancelled booking details")}

      ${bookingDetailsTable(details)}

      ${sectionHeading("Cancellation information")}

      ${infoBox(`
        <p style="margin:0;">
          <strong>Cancelled by:</strong>
          ${escapeHtml(cancelledBy)}
        </p>

        <p style="margin:9px 0 0;">
          <strong>Reason:</strong>
          ${escapeHtml(info.reason)}
        </p>
      `)}

      ${sectionHeading("Your refund details")}

      ${infoBox(
        refundMessageHtml,
        "#fff7ed",
        "#fed7aa"
      )}

      ${sectionHeading("Calendar update")}

      <p style="
        font-size:13px;
        line-height:1.9;
        color:${MUTED};
      ">
        Your interview is no longer scheduled.
        We have attached a calendar cancellation
        file to help you remove the interview
        from your calendar.
      </p>

      <p style="
        font-size:13px;
        line-height:1.9;
        color:${MUTED};
      ">
        If you manually added the event to
        Google Calendar or Outlook, you may
        need to remove it yourself.
      </p>

      ${sectionHeading("Need assistance?")}

      <p style="
        font-size:13px;
        line-height:1.9;
      ">
        If you have any questions about
        your cancellation or refund,
        contact us at

        <a
          href="mailto:${SUPPORT_EMAIL}"
          style="
            color:${DARK_ORANGE};
            font-weight:800;
            text-decoration:none;
          "
        >
          ${SUPPORT_EMAIL}
        </a>.

        Please mention your booking ID:
        <strong>
          ${escapeHtml(details.bookingId)}
        </strong>.
      </p>

      <p style="
        margin-top:26px;
        font-size:14px;
        line-height:1.8;
      ">
        Regards,<br/>
        <strong>Team Target Trek</strong>
      </p>
    `,
  });

  /* =====================================================
     ADMIN EMAIL

     Keep detailed information for internal
     refund processing and reconciliation.
  ===================================================== */

  const adminHtml = emailTemplate({
    eyebrow: "Cancellation Alert",
    title: "Interview booking cancelled",
    subtitle:
      "A mock interview has been cancelled. Review the cancellation and refund information.",

    content: `
      ${infoBox(`
        <strong style="color:${DARK_ORANGE};">
          Cancellation recorded
        </strong>

        <p style="margin:9px 0 0;">
          <strong>Booking ID:</strong>
          ${escapeHtml(details.bookingId)}
        </p>

        <p style="margin:9px 0 0;">
          <strong>Cancelled by:</strong>
          ${escapeHtml(cancelledBy)}
        </p>

        <p style="margin:9px 0 0;">
          <strong>Reason:</strong>
          ${escapeHtml(info.reason)}
        </p>
      `)}

      ${sectionHeading("Booking details")}

      ${bookingDetailsTable(details, {
        admin: true,
      })}

      ${sectionHeading("Internal refund details")}

      ${refundDetailsTable(info)}

      ${infoBox(`
        <strong>Action required</strong>

        <p style="margin:8px 0 0;">
          Verify the refund amount against the
          persisted booking record and initiate
          any eligible refund through Cashfree.
        </p>

        <p style="margin:8px 0 0;">
          Monitor the refund until the gateway
          confirms the final status.
        </p>

        <p style="margin:8px 0 0;">
          Notify the assigned interviewer and
          ensure the calendar is updated.
        </p>
      `)}
    `,
  });

  /* =====================================================
     CANDIDATE PLAIN TEXT

     Simplified refund information:
     - No internal refund reference
     - No detailed fee breakdown
     - Clear refundable amount and timeline
  ===================================================== */

  const candidateText = `
Hi ${details.name},

Your Target Trek mock interview has been cancelled.

BOOKING DETAILS

Booking ID: ${details.bookingId}
Interview: ${details.title}
Date: ${formatDate(details.start)}
Time: ${formatTime(details.start)} - ${formatTime(details.end)} IST

Cancelled by: ${cancelledBy}
Reason: ${info.reason}

YOUR REFUND DETAILS

${refundMessageText}

CALENDAR UPDATE

The attached calendar cancellation file can help remove the interview from your calendar.

If you added the event manually, please remove it from Google Calendar or Outlook.

For assistance, contact ${SUPPORT_EMAIL}.

Regards,
Team Target Trek
  `.trim();

  /* =====================================================
     ADMIN PLAIN TEXT
  ===================================================== */

  const adminText = `
Interview booking cancelled.

${bookingDetailsText(details)}

Cancelled by: ${cancelledBy}
Reason: ${info.reason}

Amount paid: ${paidAmount}
Cancellation fee: ${money(info.fee)}
Eligible refund: ${refundableAmount}
Refund status: ${info.refundStatus}
Refund reference: ${info.refundId}

Please verify refund processing in Cashfree
and update the interviewer's calendar.
  `.trim();

  /* =====================================================
     CALENDAR CANCELLATION FILE

     Same booking UID as the original invitation,
     with increased sequence and CANCEL method.
  ===================================================== */

  const calendarFile = createCalendarFile(
    details,
    {
      cancelled: true,
      reason: info.reason,
      sequence: 1,
    }
  );

  /* =====================================================
     SEND CANDIDATE FIRST, ADMIN SECOND
  ===================================================== */

  return sendCandidateThenAdmin({
    candidateEmail: details.email,

    candidateSubject:
      `Interview Cancelled | ${details.bookingId}`,

    candidateText,
    candidateHtml,

    candidateOptions: {
      attachments: [
        {
          filename:
            `TargetTrek-Cancelled-${details.bookingId}.ics`,
          content: calendarFile,
          contentType:
            "text/calendar; method=CANCEL; charset=UTF-8",
        },
      ],
    },

    adminSubject:
      `Interview Cancellation | ${details.bookingId}`,

    adminText,
    adminHtml,
  });
}
