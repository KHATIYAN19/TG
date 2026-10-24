
import sendMail from "../utils/MailSender.js";

/* =========================================================
   TARGET TREK — INTERVIEW EMAIL SERVICE

   Supports:
   1. Booking confirmation
   2. Candidate confirmation email
   3. Admin booking notification
   4. Google Calendar link
   5. Outlook Calendar link
   6. Base64 encoded .ics invitation
   7. Interview cancellation email
   8. .ics calendar cancellation
   9. Refund and cancellation details

   FIXED:
   Mailtrap requires Base64 attachment content.

   Existing exports:
   - sendInterviewConfirmation
   - sendInterviewCancellation
========================================================= */

const BRAND = "Target Trek";

const SITE_URL =
  "https://www.targettrek.in";

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

/* =========================================================
   SHARED TEXT HELPERS
========================================================= */

function escapeHtml(value) {
  return String(value ?? "").replace(
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
}

function stringValue(
  value,
  fallback = "—"
) {
  const text =
    String(value ?? "").trim();

  return text || fallback;
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function roundMoney(value) {
  return (
    Math.round(
      (Number(value) + Number.EPSILON) *
        100
    ) / 100
  );
}

function money(amount) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(Number(amount) || 0);
}

function validDate(value) {
  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
    throw new Error(
      "Invalid interview date"
    );
  }

  return date;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
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
}

function formatTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime())
  ) {
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
}

function formatDateTime(value) {
  return (
    `${formatDate(value)} at ` +
    `${formatTime(value)} IST`
  );
}

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

/* =========================================================
   BOOKING DATA NORMALIZATION
========================================================= */

function getDetails(booking) {
  if (
    !booking ||
    !booking.bookingId ||
    !booking.candidate ||
    !booking.slotSnapshot
  ) {
    throw new Error(
      "Incomplete interview booking details"
    );
  }

  const snapshot =
    booking.slotSnapshot;

  const start = validDate(
    snapshot.startTime
  );

  const durationMinutes =
    Number(
      snapshot.durationMinutes ||
        45
    );

  const end =
    snapshot.endTime
      ? validDate(
          snapshot.endTime
        )
      : new Date(
          start.getTime() +
            durationMinutes *
              60000
        );

  if (end <= start) {
    throw new Error(
      "Interview end time must be after start time"
    );
  }

  const candidate =
    booking.candidate;

  const meetingUrl = safeUrl(
    booking.meeting?.url ||
      booking.meetingUrl
  );

  const selectedTopics =
    Array.isArray(
      booking.selectedTopics
    )
      ? booking.selectedTopics.map(
          (topic) =>
            TOPICS[topic] ||
            topic
        )
      : [];

  const candidateEmail =
    stringValue(
      candidate.email,
      ""
    );

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      candidateEmail
    )
  ) {
    throw new Error(
      "Invalid candidate email address"
    );
  }

  return {
    bookingId: String(
      booking.bookingId
    ),

    name: stringValue(
      candidate.name
    ),

    email: candidateEmail,

    phone: stringValue(
      candidate.phone
    ),

    experience:
      candidate.experienceYears,

    currentRole: stringValue(
      candidate.currentRole
    ),

    targetRole: stringValue(
      candidate.targetRole
    ),

    notes: stringValue(
      candidate.notes,
      "None"
    ),

    resumeUrl: safeUrl(
      candidate.resumeUrl
    ),

    title: stringValue(
      snapshot.title,
      "1:1 Technical Mock Interview"
    ),

    start,
    end,

    durationMinutes:
      Math.round(
        (end.getTime() -
          start.getTime()) /
          60000
      ),

    topics:
      selectedTopics,

    amount:
      roundMoney(
        snapshot.price
      ),

    meetingUrl,

    paymentStatus:
      stringValue(
        booking.payment?.status,
        "UNKNOWN"
      ),

    paymentOrderId:
      stringValue(
        booking.payment
          ?.gatewayOrderId
      ),

    refundStatus:
      stringValue(
        booking.refund?.status,
        "NOT_REQUESTED"
      ),
  };
}

/* =========================================================
   ICS HELPERS

   RFC 5545:
   - UTC timestamps
   - CRLF line endings
   - Escaped text fields
   - 75 octet line folding
   - Stable UID
   - Incremented SEQUENCE on cancellation
========================================================= */

function icsTimestamp(value) {
  return validDate(value)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function icsEscape(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function escapeIcsParameter(value) {
  return String(value ?? "")
    .replace(/\^/g, "^^")
    .replace(/\n/g, "^n")
    .replace(/"/g, "^'");
}

function foldIcsLine(line) {
  const result = [];

  let current = "";
  let currentBytes = 0;

  for (const character of line) {
    const bytes =
      Buffer.byteLength(
        character,
        "utf8"
      );

    const limit =
      result.length > 0
        ? 74
        : 75;

    if (
      current &&
      currentBytes + bytes >
        limit
    ) {
      result.push(current);

      current = "";
      currentBytes = 0;
    }

    current += character;
    currentBytes += bytes;
  }

  if (current) {
    result.push(current);
  }

  return result
    .map(
      (part, index) =>
        index === 0
          ? part
          : ` ${part}`
    )
    .join("\r\n");
}

function calendarUid(
  bookingId
) {
  const safeId =
    String(bookingId)
      .replace(
        /[^A-Za-z0-9_-]/g,
        ""
      );

  return (
    `${safeId}@targettrek.in`
  );
}

/* =========================================================
   CREATE ICS CALENDAR INVITATION

   Confirmation:
   METHOD:REQUEST
   STATUS:CONFIRMED

   Cancellation:
   METHOD:CANCEL
   STATUS:CANCELLED

   The same UID is used for both.
========================================================= */

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

    `Topics: ${details.topics.join(
      ", "
    )}`,

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

  const organizerEmail =
    process.env
      .INTERVIEW_ORGANIZER_EMAIL ||
    SUPPORT_EMAIL;

  const lines = [
    "BEGIN:VCALENDAR",

    "VERSION:2.0",

    "PRODID:-//Target Trek//Mock Interviews//EN",

    "CALSCALE:GREGORIAN",

    `METHOD:${
      cancelled
        ? "CANCEL"
        : "REQUEST"
    }`,

    "BEGIN:VEVENT",

    `UID:${calendarUid(
      details.bookingId
    )}`,

    `DTSTAMP:${icsTimestamp(
      new Date()
    )}`,

    `DTSTART:${icsTimestamp(
      details.start
    )}`,

    `DTEND:${icsTimestamp(
      details.end
    )}`,

    `SEQUENCE:${Math.max(
      0,
      Number(sequence) || 0
    )}`,

    `STATUS:${
      cancelled
        ? "CANCELLED"
        : "CONFIRMED"
    }`,

    `SUMMARY:${icsEscape(
      `${details.title} | Target Trek`
    )}`,

    `DESCRIPTION:${icsEscape(
      description
    )}`,

    `ORGANIZER;CN="Target Trek":mailto:${organizerEmail}`,

    `ATTENDEE;CN="${escapeIcsParameter(
      details.name
    )}";ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE:mailto:${details.email}`,

    details.meetingUrl
      ? `LOCATION:${icsEscape(
          details.meetingUrl
        )}`
      : "LOCATION:Online",

    ...(details.meetingUrl
      ? [
          `URL:${details.meetingUrl}`,
        ]
      : []),

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
    lines
      .map(foldIcsLine)
      .join("\r\n") +
    "\r\n"
  );
}

/* =========================================================
   FIXED: MAILTRAP ICS ATTACHMENT

   Your original code used:

   content: calendarFile

   Mailtrap expects Base64, so this helper
   encodes the plain text calendar.

   Use Mailtrap fields:
   - filename
   - content
   - type
   - disposition
========================================================= */

function createIcsAttachment(
  details,
  {
    cancelled = false,
    reason = "",
    sequence = 0,
  } = {}
) {
  const calendarFile =
    createCalendarFile(
      details,
      {
        cancelled,
        reason,
        sequence,
      }
    );

  const filename =
    cancelled
      ? `TargetTrek-Cancelled-${details.bookingId}.ics`
      : `TargetTrek-${details.bookingId}.ics`;

  const method =
    cancelled
      ? "CANCEL"
      : "REQUEST";

  const content =
    Buffer.from(
      calendarFile,
      "utf8"
    ).toString("base64");

  if (!content) {
    throw new Error(
      "Failed to generate calendar attachment"
    );
  }

  return {
    filename,

    content,

    type:
      `text/calendar; ` +
      `method=${method}; ` +
      "charset=UTF-8",

    disposition:
      "attachment",
  };
}

/* =========================================================
   GOOGLE + OUTLOOK CALENDAR LINKS
========================================================= */

function calendarLinks(
  details
) {
  const start =
    icsTimestamp(
      details.start
    );

  const end =
    icsTimestamp(
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

  const google =
    new URL(
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

  const outlook =
    new URL(
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
    google:
      google.toString(),

    outlook:
      outlook.toString(),
  };
}

/* =========================================================
   EMAIL HTML HELPERS
========================================================= */

function detailRow(
  label,
  value
) {
  return `
    <tr>
      <td style="
        padding:12px 14px;
        border-bottom:1px solid #f3e7dc;
        color:#78716c;
        font-size:13px;
        width:37%;
        vertical-align:top;
      ">
        ${escapeHtml(label)}
      </td>

      <td style="
        padding:12px 14px;
        border-bottom:1px solid #f3e7dc;
        color:#292524;
        font-size:13px;
        font-weight:700;
        vertical-align:top;
        overflow-wrap:anywhere;
      ">
        ${escapeHtml(value)}
      </td>
    </tr>
  `;
}

function sectionHeading(
  title
) {
  return `
    <h3 style="
      margin:28px 0 12px;
      color:#292524;
      font-size:17px;
      line-height:1.4;
      font-weight:800;
    ">
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
      line-height:1.8;
    ">
      ${content}
    </div>
  `;
}

function button(
  label,
  url,
  secondary = false
) {
  const safe =
    safeUrl(url);

  if (!safe) return "";

  return `
    <a
      href="${escapeHtml(safe)}"
      target="_blank"
      rel="noopener noreferrer"
      style="
        display:inline-block;
        background:${
          secondary
            ? "#ffffff"
            : ORANGE
        };
        color:${
          secondary
            ? DARK_ORANGE
            : "#ffffff"
        };
        border:1px solid ${
          secondary
            ? "#fed7aa"
            : ORANGE
        };
        border-radius:9px;
        padding:13px 19px;
        margin:5px 6px 5px 0;
        font-size:13px;
        font-weight:800;
        text-decoration:none;
      "
    >
      ${escapeHtml(label)}
    </a>
  `;
}

/* =========================================================
   MAIN EMAIL TEMPLATE
========================================================= */

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
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  />
  <title>${escapeHtml(title)}</title>
</head>

<body style="
  margin:0;
  padding:0;
  background:#fff7ed;
  font-family:Arial,Helvetica,sans-serif;
  color:#292524;
">

  <div style="
    display:none;
    max-height:0;
    overflow:hidden;
    opacity:0;
  ">
    ${escapeHtml(subtitle)}
  </div>

  <table
    role="presentation"
    cellpadding="0"
    cellspacing="0"
    width="100%"
    style="background:#fff7ed;"
  >
    <tr>
      <td
        align="center"
        style="padding:30px 12px;"
      >

        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            max-width:640px;
            background:#ffffff;
            border-radius:18px;
            overflow:hidden;
            border:1px solid #fed7aa;
          "
        >

          <tr>
            <td style="
              padding:27px 30px;
              background:${ORANGE};
              color:#ffffff;
            ">

              <div style="
                font-size:24px;
                font-weight:900;
                letter-spacing:-.7px;
              ">
                TARGET TREK
              </div>

              <div style="
                font-size:11px;
                letter-spacing:2px;
                text-transform:uppercase;
                margin-top:9px;
                color:#ffedd5;
                font-weight:700;
              ">
                ${escapeHtml(eyebrow)}
              </div>

            </td>
          </tr>

          <tr>
            <td style="
              padding:28px 27px 30px;
            ">

              <h1 style="
                font-size:25px;
                line-height:1.25;
                letter-spacing:-.5px;
                margin:0 0 12px;
                color:#292524;
              ">
                ${escapeHtml(title)}
              </h1>

              <p style="
                color:#78716c;
                font-size:14px;
                line-height:1.8;
                margin:0 0 24px;
              ">
                ${escapeHtml(subtitle)}
              </p>

              ${content}

              <div style="
                margin-top:34px;
                padding-top:22px;
                border-top:1px solid #f3e7dc;
              ">

                <p style="
                  font-size:12px;
                  color:#78716c;
                  line-height:1.9;
                  margin:0;
                ">
                  Need help? Contact
                  <a
                    href="mailto:${SUPPORT_EMAIL}"
                    style="
                      color:${DARK_ORANGE};
                      text-decoration:none;
                      font-weight:700;
                    "
                  >
                    ${SUPPORT_EMAIL}
                  </a>
                </p>

                <p style="
                  color:#78716c;
                  font-size:12px;
                  line-height:1.8;
                  margin:10px 0 0;
                ">
                  This is a transactional email
                  from ${BRAND} regarding your
                  mock interview booking.
                </p>

              </div>

            </td>
          </tr>

          <tr>
            <td style="
              padding:20px 25px;
              text-align:center;
              background:#fff7ed;
            ">

              <a
                href="${SITE_URL}"
                style="
                  color:${DARK_ORANGE};
                  text-decoration:none;
                  font-size:12px;
                  font-weight:800;
                "
              >
                www.targettrek.in
              </a>

              <p style="
                margin:9px 0 0;
                font-size:11px;
                color:#a8a29e;
              ">
                © ${new Date().getFullYear()}
                Target Trek
              </p>

            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
}

/* =========================================================
   BOOKING DETAILS TABLE
========================================================= */

function bookingDetailsTable(
  details,
  {
    admin = false,
  } = {}
) {
  const rows = [
    [
      "Booking ID",
      details.bookingId,
    ],
    [
      "Interview",
      details.title,
    ],
    [
      "Date",
      formatDate(details.start),
    ],
    [
      "Time",
      `${formatTime(details.start)} – ${formatTime(details.end)} IST`,
    ],
    [
      "Duration",
      `${details.durationMinutes} minutes`,
    ],
    [
      "Selected topics",
      details.topics.join(", ") ||
        "—",
    ],
    [
      "Candidate name",
      details.name,
    ],
    [
      "Email",
      details.email,
    ],
    [
      "Phone",
      details.phone,
    ],
    [
      "Experience",
      details.experience == null
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
        details.resumeUrl ||
          "Not provided",
      ]
    );
  }

  return `
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="
        width:100%;
        border-collapse:collapse;
        border:1px solid #f3e7dc;
        border-radius:12px;
      "
    >
      ${rows
        .map(
          ([label, value]) =>
            detailRow(
              label,
              value
            )
        )
        .join("")}
    </table>
  `;
}

/* =========================================================
   MEETING LINK SECTION
========================================================= */

function meetingSection(
  details
) {
  if (!details.meetingUrl) {
    return infoBox(`
      <strong style="
        color:${DARK_ORANGE};
      ">
        Meeting link will be shared separately
      </strong>

      <p style="margin:7px 0 0;">
        Your booking is confirmed.
        The joining link has not yet
        been assigned.

        Please check your email for
        an update before your scheduled
        interview.
      </p>
    `);
  }

  return `
    ${sectionHeading(
      "Your interview joining link"
    )}

    ${infoBox(`
      <strong style="
        color:${DARK_ORANGE};
      ">
        Online interview
      </strong>

      <p style="
        margin:8px 0;
        overflow-wrap:anywhere;
      ">
        ${escapeHtml(
          details.meetingUrl
        )}
      </p>

      ${button(
        "Join Your Interview",
        details.meetingUrl
      )}
    `)}

    <p style="
      font-size:12px;
      color:#78716c;
      line-height:1.7;
    ">
      Please join 5 minutes early
      and check your internet,
      microphone and camera.
    </p>
  `;
}

/* =========================================================
   CALENDAR SECTION
========================================================= */

function calendarSection(
  details
) {
  const links =
    calendarLinks(details);

  return `
    ${sectionHeading(
      "Add this interview to your calendar"
    )}

    <p style="
      color:#78716c;
      font-size:13px;
      line-height:1.8;
    ">
      Save your session so you do
      not miss it.

      Calendar invitations use
      the correct interview time
      and will display in your
      calendar's local timezone.
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
      <strong>
        Apple Calendar or other apps
      </strong>

      <p style="margin:7px 0 0;">
        An interview calendar invitation
        (.ics file) is attached to this
        email.

        Open the attachment to add
        your session to a compatible
        calendar application.
      </p>
    `)}
  `;
}

/* =========================================================
   CANCELLATION AND REFUND POLICY
========================================================= */

function cancellationPolicySection() {
  return `
    ${sectionHeading(
      "Cancellation & refund policy"
    )}

    ${infoBox(`
      <p style="margin:0 0 10px;">
        <strong>
          Candidate-requested cancellation:
        </strong>

        A one-time cancellation charge
        of <strong>
          ${money(CANCELLATION_FEE)}
        </strong>
        applies to the booking.
      </p>

      <p style="margin:0 0 10px;">
        <strong>
          Cancellation by Target Trek:
        </strong>

        If Target Trek cancels your
        session for an administrative
        or operational reason,
        you will receive a
        <strong>
          full refund without a
          cancellation fee
        </strong>.
      </p>

      <p style="margin:0 0 10px;">
        Approved refunds are returned
        to the original payment method,
        generally within
        <strong>
          7 business days after
          successful refund initiation
        </strong>,
        subject to payment-provider
        and bank processing.
      </p>

      <p style="margin:0;">
        To request cancellation,
        email
        <a
          href="mailto:${SUPPORT_EMAIL}"
          style="
            color:${DARK_ORANGE};
            font-weight:800;
          "
        >
          ${SUPPORT_EMAIL}
        </a>
        with your booking ID
        and cancellation reason.
      </p>
    `)}
  `;
}

/* =========================================================
   BOOKING DETAILS — PLAIN TEXT
========================================================= */

function bookingDetailsText(
  details
) {
  return [
    `Booking ID: ${details.bookingId}`,
    `Interview: ${details.title}`,
    `Date: ${formatDate(details.start)}`,

    `Time: ${formatTime(
      details.start
    )} - ${formatTime(
      details.end
    )} IST`,

    `Duration: ${details.durationMinutes} minutes`,

    `Topics: ${details.topics.join(", ")}`,

    `Candidate: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone}`,

    `Amount: ${money(details.amount)}`,

    `Payment: ${details.paymentStatus}`,

    `Meeting URL: ${
      details.meetingUrl ||
      "To be shared"
    }`,
  ].join("\n");
}

/* =========================================================
   EMAIL DELIVERY

   Candidate first.
   Admin second.

   Preserve settled-style result objects
   expected by interviewPaymentController.

   Candidate failure does not prevent
   the admin attempt.
========================================================= */

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
    const candidateInfo =
      await sendMail(
        candidateEmail,
        candidateSubject,
        candidateText,
        candidateHtml,
        {
          replyTo:
            SUPPORT_EMAIL,

          ...candidateOptions,
        }
      );

    results.push({
      status: "fulfilled",

      value:
        candidateInfo ??
        { accepted: true },
    });

    console.log(
      "[INTERVIEW EMAIL] Candidate email sent:",
      candidateEmail
    );
  } catch (error) {
    console.error(
      "[INTERVIEW EMAIL] Candidate email failed:",
      error.message
    );

    results.push({
      status: "rejected",
      reason: error,
    });
  }

  if (ADMIN_EMAIL) {
    try {
      const adminInfo =
        await sendMail(
          ADMIN_EMAIL,
          adminSubject,
          adminText,
          adminHtml,
          {
            replyTo:
              SUPPORT_EMAIL,

            ...adminOptions,
          }
        );

      results.push({
        status: "fulfilled",

        value:
          adminInfo ??
          { accepted: true },
      });

      console.log(
        "[INTERVIEW EMAIL] Admin email sent:",
        ADMIN_EMAIL
      );
    } catch (error) {
      console.error(
        "[INTERVIEW EMAIL] Admin email failed:",
        error.message
      );

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

/* =========================================================
   SEND BOOKING CONFIRMATION

   Called only after:
   booking.status === CONFIRMED
   booking.payment.status === SUCCESS

   Attaches a Base64 ICS calendar invitation.

   Candidate receives:
   - Booking details
   - Payment details
   - Interview topics
   - Joining link if assigned
   - Calendar links
   - ICS attachment
   - Cancellation policy

   Admin receives:
   - Full booking details
   - Candidate information
   - Notes and resume
   - Meeting preparation checklist
========================================================= */

export async function sendInterviewConfirmation(
  booking
) {
  if (
    booking?.status !==
      "CONFIRMED" ||
    booking?.payment?.status !==
      "SUCCESS"
  ) {
    throw new Error(
      "Cannot send confirmation for an unconfirmed payment"
    );
  }

  const details =
    getDetails(booking);

  const candidateHtml =
    emailTemplate({
      eyebrow:
        "Booking Confirmed",

      title:
        "Your interview is confirmed!",

      subtitle:
        "Your payment was successful and your mock interview is booked.",

      content: `
        <p style="
          font-size:14px;
          line-height:1.9;
        ">
          Hi
          <strong>
            ${escapeHtml(details.name)}
          </strong>,
        </p>

        <p style="
          font-size:14px;
          line-height:1.9;
        ">
          Thank you for booking
          your mock interview with
          <strong>Target Trek</strong>.

          Your session is confirmed.
          Below are the details
          you need to prepare and join.
        </p>

        ${infoBox(`
          <div style="
            font-size:12px;
            font-weight:800;
            color:${DARK_ORANGE};
            letter-spacing:1px;
          ">
            YOUR INTERVIEW
          </div>

          <div style="
            font-size:20px;
            font-weight:900;
            margin-top:7px;
          ">
            ${escapeHtml(
              formatDate(
                details.start
              )
            )}
          </div>

          <div style="
            font-size:17px;
            font-weight:800;
            margin-top:5px;
          ">
            ${escapeHtml(
              formatTime(
                details.start
              )
            )}
            –
            ${escapeHtml(
              formatTime(
                details.end
              )
            )}
            IST
          </div>

          <div style="
            margin-top:9px;
            color:${MUTED};
          ">
            ${details.durationMinutes}
            minutes · Online ·
            1:1 Mock Interview
          </div>
        `)}

        ${sectionHeading(
          "Booking & payment details"
        )}

        ${bookingDetailsTable(
          details
        )}

        ${meetingSection(
          details
        )}

        ${calendarSection(
          details
        )}

        ${sectionHeading(
          "Before your interview"
        )}

        <p style="
          font-size:13px;
          line-height:1.9;
        ">
          • Join at least
          5 minutes early.
          <br/>

          • Use a stable
          internet connection.
          <br/>

          • Check your camera
          and microphone.
          <br/>

          • Keep your resume
          and project notes ready.
          <br/>

          • Be prepared to
          discuss your selected topics.
        </p>

        ${cancellationPolicySection()}

        <p style="
          margin-top:25px;
          font-size:14px;
          line-height:1.8;
        ">
          We look forward
          to your session!
          <br/>

          <strong>
            Team Target Trek
          </strong>
        </p>
      `,
    });

  const adminHtml =
    emailTemplate({
      eyebrow:
        "Admin Notification",

      title:
        "New paid interview booking",

      subtitle:
        "A candidate has completed payment and reserved an interview slot.",

      content: `
        ${infoBox(`
          <strong style="
            color:${DARK_ORANGE};
          ">
            Payment verified
          </strong>

          <p style="
            margin:7px 0 0;
          ">
            Booking ID:
            <strong>
              ${escapeHtml(
                details.bookingId
              )}
            </strong>
          </p>
        `)}

        ${sectionHeading(
          "Interview information"
        )}

        ${bookingDetailsTable(
          details,
          {
            admin: true,
          }
        )}

        ${sectionHeading(
          "Meeting details"
        )}

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

        ${sectionHeading(
          "Administrative checklist"
        )}

        <p style="
          font-size:13px;
          line-height:1.9;
        ">
          • Verify the assigned interviewer.
          <br/>

          • Check the candidate's
          selected topics.
          <br/>

          • Review candidate
          notes and resume.
          <br/>

          • Ensure the meeting
          link is ready.
          <br/>

          • Conduct the session
          at the scheduled time.
        </p>
      `,
    });

  const links =
    calendarLinks(details);

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

Candidate-requested cancellation fee:
${money(CANCELLATION_FEE)}.

Admin-initiated cancellation:
Full refund to original payment method,
generally within 7 business days after
successful refund initiation.

Team Target Trek
  `.trim();

  const adminText = `
New paid interview booking.

${bookingDetailsText(details)}

Candidate notes:
${details.notes}

Resume:
${details.resumeUrl || "Not provided"}
  `.trim();

  /* =====================================================
     FIXED ICS ATTACHMENT

     Base64 is generated here.
     Never send the raw calendarFile string.
  ===================================================== */

  const calendarAttachment =
    createIcsAttachment(
      details,
      {
        cancelled: false,
        sequence: 0,
      }
    );

  return sendCandidateThenAdmin({
    candidateEmail:
      details.email,

    candidateSubject:
      `Interview Confirmed | ` +
      `${formatDate(
        details.start
      )} | ` +
      details.bookingId,

    candidateText,

    candidateHtml,

    candidateOptions: {
      attachments: [
        calendarAttachment,
      ],
    },

    adminSubject:
      `New Paid Interview Booking | ` +
      details.bookingId,

    adminText,

    adminHtml,
  });
}

/* =========================================================
   CANCELLATION REFUND CALCULATION

   Cancellation policy:
   - Candidate cancellation: ₹199 fee
   - Admin cancellation: no fee
   - Stored refund amount takes priority
   - Never claim a refund was completed
     without SUCCESS status
========================================================= */

function calculateCancellation(
  booking,
  details
) {
  const cancelledByRole =
    normalize(
      booking.cancellation
        ?.cancelledByRole
    );

  const isAdminCancellation =
    [
      "ADMIN",
      "EMPLOYEE",
      "SYSTEM",
    ].includes(
      cancelledByRole
    );

  const paid =
    booking.payment?.status ===
    "SUCCESS";

  const paidAmount =
    paid
      ? details.amount
      : 0;

  const policyFee =
    isAdminCancellation
      ? 0
      : Math.min(
          CANCELLATION_FEE,
          paidAmount
        );

  const policyRefundAmount =
    roundMoney(
      Math.max(
        0,
        paidAmount -
          policyFee
      )
    );

  const storedRefundAmount =
    booking.refund?.amount;

  const hasStoredRefundAmount =
    storedRefundAmount !==
      null &&
    storedRefundAmount !==
      undefined &&
    Number.isFinite(
      Number(
        storedRefundAmount
      )
    );

  const refundAmount =
    hasStoredRefundAmount
      ? roundMoney(
          Math.max(
            0,
            Math.min(
              paidAmount,
              Number(
                storedRefundAmount
              )
            )
          )
        )
      : policyRefundAmount;

  const fee =
    roundMoney(
      Math.max(
        0,
        paidAmount -
          refundAmount
      )
    );

  const refundStatus =
    normalize(
      booking.refund?.status ||
        (paid
          ? "NOT_INITIATED"
          : "NOT_APPLICABLE")
    );

  const reason =
    stringValue(
      booking.cancellation
        ?.reason,
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

    refundId:
      stringValue(
        booking.refund
          ?.gatewayRefundId,
        "Not assigned"
      ),

    initiatedAt:
      booking.refund
        ?.initiatedAt ||
      null,

    completedAt:
      booking.refund
        ?.completedAt ||
      booking.refund
        ?.refundedAt ||
      null,
  };
}

/* =========================================================
   REFUND STATUS DESCRIPTION
========================================================= */

function refundStatusDescription(
  info
) {
  if (!info.paid) {
    return (
      "No successful payment was recorded " +
      "for this booking, so no refund is due."
    );
  }

  switch (
    info.refundStatus
  ) {
    case "SUCCESS":
      return (
        "The refund has been marked successful " +
        "by the payment provider. The credit " +
        "should appear on the original payment " +
        "method according to bank processing timelines."
      );

    case "PROCESSING":
    case "PENDING":
    case "ONHOLD":
      return (
        "Your refund is pending or processing. " +
        "This does not mean it has been completed. " +
        "Once successfully initiated, the target " +
        "credit timeline is within 7 business days, " +
        "subject to gateway and bank processing."
      );

    case "FAILED":
      return (
        "The refund attempt was unsuccessful. " +
        "Contact support with your booking ID."
      );

    default:
      return (
        "Refund initiation has not yet been confirmed. " +
        "Our team will review your refund status."
      );
  }
}

/* =========================================================
   REFUND DETAILS TABLE
========================================================= */

function refundDetailsTable(
  info
) {
  const rows = [
    [
      "Amount paid",
      money(
        info.paidAmount
      ),
    ],
    [
      "Cancellation fee",
      money(info.fee),
    ],
    [
      "Eligible refund",
      money(
        info.refundAmount
      ),
    ],
    [
      "Refund status",
      info.refundStatus,
    ],
    [
      "Refund reference",
      info.refundId,
    ],
    [
      "Cancelled by",
      info.isAdminCancellation
        ? "Target Trek"
        : "Candidate",
    ],
    [
      "Reason",
      info.reason,
    ],
  ];

  if (
    info.initiatedAt
  ) {
    rows.push([
      "Refund initiated",
      formatDateTime(
        info.initiatedAt
      ),
    ]);
  }

  if (
    info.completedAt
  ) {
    rows.push([
      "Refund completed",
      formatDateTime(
        info.completedAt
      ),
    ]);
  }

  return `
    <table
      role="presentation"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="
        width:100%;
        border-collapse:collapse;
        border:1px solid #f3e7dc;
      "
    >
      ${rows
        .map(
          ([label, value]) =>
            detailRow(
              label,
              value
            )
        )
        .join("")}
    </table>
  `;
}

/* =========================================================
   SEND INTERVIEW CANCELLATION

   Candidate:
   - Cancellation details
   - Refund status
   - Refund amount
   - Calendar cancellation ICS

   Admin:
   - Full cancellation information
   - Refund details
   - Follow-up actions

   Cancellation ICS uses:
   - Same UID as invitation
   - METHOD:CANCEL
   - STATUS:CANCELLED
   - SEQUENCE:1

   Fixes the same Base64 problem in the
   cancellation email.
========================================================= */

export async function sendInterviewCancellation(
  booking
) {
  if (!booking) {
    throw new Error(
      "Interview booking is required"
    );
  }

  const details =
    getDetails(booking);

  const info =
    calculateCancellation(
      booking,
      details
    );

  const cancelledBy =
    info.isAdminCancellation
      ? "Target Trek"
      : "Candidate";

  const paidAmount =
    money(
      info.paidAmount
    );

  const refundableAmount =
    money(
      info.refundAmount
    );

  const refundDescription =
    refundStatusDescription(
      info
    );

  /* =====================================================
     CANDIDATE EMAIL
  ===================================================== */

  const candidateHtml =
    emailTemplate({
      eyebrow:
        "Interview Cancellation",

      title:
        "Your interview has been cancelled",

      subtitle:
        `Booking ${details.bookingId} has been cancelled.`,

      content: `
        <p style="
          font-size:14px;
          line-height:1.9;
        ">
          Hi
          <strong>
            ${escapeHtml(
              details.name
            )}
          </strong>,
        </p>

        <p style="
          font-size:14px;
          line-height:1.9;
        ">
          Your Target Trek mock
          interview booking has
          been cancelled.

          Please review the
          cancellation and refund
          details below.
        </p>

        ${infoBox(`
          <strong style="
            color:${DARK_ORANGE};
          ">
            Booking cancelled
          </strong>

          <p style="
            margin:8px 0 0;
          ">
            Booking ID:
            <strong>
              ${escapeHtml(
                details.bookingId
              )}
            </strong>
          </p>

          <p style="
            margin:7px 0 0;
          ">
            Cancelled by:
            <strong>
              ${escapeHtml(
                cancelledBy
              )}
            </strong>
          </p>

          <p style="
            margin:7px 0 0;
          ">
            Reason:
            ${escapeHtml(
              info.reason
            )}
          </p>
        `)}

        ${sectionHeading(
          "Cancelled interview"
        )}

        ${bookingDetailsTable(
          details
        )}

        ${sectionHeading(
          "Refund information"
        )}

        ${refundDetailsTable(
          info
        )}

        ${infoBox(`
          <strong style="
            color:${DARK_ORANGE};
          ">
            Current refund status:
            ${escapeHtml(
              info.refundStatus
            )}
          </strong>

          <p style="
            margin:8px 0 0;
            color:${TEXT};
          ">
            ${escapeHtml(
              refundDescription
            )}
          </p>
        `)}

        ${
          info.paid &&
          info.isAdminCancellation
            ? infoBox(`
                <strong>
                  Cancellation by Target Trek
                </strong>

                <p style="
                  margin:7px 0 0;
                ">
                  No cancellation fee
                  applies to an
                  admin-initiated
                  cancellation.
                </p>
              `)
            : info.paid
              ? infoBox(`
                  <strong>
                    Candidate-requested
                    cancellation
                  </strong>

                  <p style="
                    margin:7px 0 0;
                  ">
                    The applicable
                    cancellation fee,
                    if any, is reflected
                    in the refund
                    calculation above.
                  </p>
                `)
              : ""
        }

        ${sectionHeading(
          "Calendar cancellation"
        )}

        <p style="
          font-size:13px;
          line-height:1.9;
        ">
          A calendar cancellation
          file is attached.

          Open the
          <strong>.ics</strong>
          attachment to update
          the matching interview
          event in your calendar.
        </p>

        <p style="
          margin-top:25px;
          font-size:14px;
          line-height:1.8;
        ">
          Need assistance?
          Contact
          <a
            href="mailto:${SUPPORT_EMAIL}"
            style="
              color:${DARK_ORANGE};
              font-weight:800;
            "
          >
            ${SUPPORT_EMAIL}
          </a>.
        </p>

        <p style="
          font-size:14px;
          line-height:1.8;
        ">
          Regards,
          <br/>

          <strong>
            Team Target Trek
          </strong>
        </p>
      `,
    });

  /* =====================================================
     ADMIN CANCELLATION EMAIL
  ===================================================== */

  const adminHtml =
    emailTemplate({
      eyebrow:
        "Admin Cancellation Notice",

      title:
        "Interview booking cancelled",

      subtitle:
        `Booking ${details.bookingId} was cancelled.`,

      content: `
        ${infoBox(`
          <strong style="
            color:${DARK_ORANGE};
          ">
            Cancellation recorded
          </strong>

          <p style="
            margin:7px 0 0;
          ">
            Booking ID:
            <strong>
              ${escapeHtml(
                details.bookingId
              )}
            </strong>
          </p>

          <p style="
            margin:7px 0 0;
          ">
            Cancelled by:
            <strong>
              ${escapeHtml(
                cancelledBy
              )}
            </strong>
          </p>
        `)}

        ${sectionHeading(
          "Interview details"
        )}

        ${bookingDetailsTable(
          details,
          {
            admin: true,
          }
        )}

        ${sectionHeading(
          "Cancellation & refund"
        )}

        ${refundDetailsTable(
          info
        )}

        ${infoBox(`
          <strong>
            Refund status:
            ${escapeHtml(
              info.refundStatus
            )}
          </strong>

          <p style="
            margin:7px 0 0;
          ">
            ${escapeHtml(
              refundDescription
            )}
          </p>
        `)}

        ${sectionHeading(
          "Required admin actions"
        )}

        <p style="
          font-size:13px;
          line-height:1.9;
        ">
          • Verify Cashfree refund
          status and amount.
          <br/>

          • Notify the assigned
          interviewer.
          <br/>

          • Remove or update the
          calendar event.
          <br/>

          • Contact the candidate
          if additional action
          is required.
          <br/>

          • Do not mark a refund
          completed until confirmed
          by the payment provider.
        </p>
      `,
    });

  /* =====================================================
     PLAIN TEXT EMAILS
  ===================================================== */

  const candidateText = `
Hi ${details.name},

Your Target Trek mock interview has been cancelled.

Booking ID: ${details.bookingId}
Interview: ${details.title}

Scheduled Date: ${formatDate(details.start)}
Scheduled Time: ${formatTime(details.start)} IST

Cancelled by: ${cancelledBy}
Reason: ${info.reason}

Amount paid: ${paidAmount}
Cancellation fee: ${money(info.fee)}
Eligible refund: ${refundableAmount}
Refund status: ${info.refundStatus}
Refund reference: ${info.refundId}

${refundDescription}

The attached .ics cancellation file
can be used to update the event
in your calendar.

For support:
${SUPPORT_EMAIL}

Team Target Trek
  `.trim();

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

Please verify the refund in Cashfree
and update the interviewer's calendar.
  `.trim();

  /* =====================================================
     FIXED CALENDAR CANCELLATION ATTACHMENT

     Previously:
       content: calendarFile

     Now:
       content: Base64 encoded ICS

     The UID matches the confirmation ICS.
  ===================================================== */

  const calendarAttachment =
    createIcsAttachment(
      details,
      {
        cancelled: true,

        reason:
          info.reason,

        sequence: 1,
      }
    );

  return sendCandidateThenAdmin({
    candidateEmail:
      details.email,

    candidateSubject:
      `Interview Cancelled | ` +
      details.bookingId,

    candidateText,

    candidateHtml,

    candidateOptions: {
      attachments: [
        calendarAttachment,
      ],
    },

    adminSubject:
      `Interview Cancellation | ` +
      details.bookingId,

    adminText,

    adminHtml,
  });
}
