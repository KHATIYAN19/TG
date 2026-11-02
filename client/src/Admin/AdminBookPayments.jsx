import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Helmet } from "react-helmet-async";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { useSelector } from "react-redux";

import toast from "react-hot-toast";

import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BadgePercent,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  Clock3,
  Copy,
  CreditCard,
  Filter,
  Globe2,
  Hash,
  KeyRound,
  Link2,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  ShieldOff,
  ShoppingBag,
  TimerReset,
  Trash2,
  UnlockKeyhole,
  UserRound,
  X,
  XCircle,
  Zap,
} from "lucide-react";

import BASE_URL from "../utils/Url";


/* =========================================================
   THEME
========================================================= */

const THEME_KEY =
  "theme";

const THEME_EVENT =
  "targettrek-theme-change";


/* =========================================================
   DEFAULT SUMMARY
========================================================= */

const EMPTY_SUMMARY = {
  totalOrders: 0,

  totalOrderAmount: 0,

  payments: {
    paidOrders: 0,

    successfulPayments: 0,

    failedPayments: 0,

    pendingPayments: 0,

    cancelledPayments: 0,

    fullyRefundedPayments: 0,

    partiallyRefundedPayments: 0,

    successfulAmount: 0,

    failedAmount: 0,

    pendingAmount: 0,

    cancelledAmount: 0,

    grossPaidAmount: 0,

    netRevenue: 0,
  },

  refunds: {
    refundOrders: 0,

    pendingRefunds: 0,

    processingRefunds: 0,

    partialRefunds: 0,

    completedRefunds: 0,

    failedRefunds: 0,

    cancelledRefunds: 0,

    totalRefundRequestedAmount: 0,

    totalRefundedAmount: 0,

    totalRefundRemainingAmount: 0,
  },

  coupons: {
    couponAppliedOrders: 0,

    totalDiscountAmount: 0,

    originalAmount: 0,

    finalAmount: 0,
  },

  reminderMails: {
    totalSent: 0,

    ordersWithReminderMail: 0,

    lastStatusSent: 0,

    lastStatusFailed: 0,

    firstMailSentAt: null,

    lastMailSentAt: null,
  },

  access: {
    totalAccessCount: 0,

    revokedAccessOrders: 0,
  },

  verification: {
    callbackHashVerified: 0,

    payuVerified: 0,

    amountVerified: 0,
  },

  affiliates: {
    affiliateOrders: 0,
  },
};


/* =========================================================
   FILTERS
========================================================= */

const FILTERS = [
  {
    key: "ALL",

    label: "All",

    icon: Filter,
  },

  {
    key: "SUCCESS",

    label: "Success",

    icon: CheckCircle2,
  },

  {
    key: "PENDING",

    label: "Pending",

    icon: Clock3,
  },

  {
    key: "FAILED",

    label: "Failed",

    icon: XCircle,
  },
];


const SUCCESS_STATUSES =
  new Set([
    "SUCCESS",
    "PAID",
    "COMPLETED",
    "CAPTURED",
  ]);


const PENDING_STATUSES =
  new Set([
    "PENDING",
    "PROCESSING",
    "INITIATED",
    "IN_PROGRESS",
  ]);


const FAILED_STATUSES =
  new Set([
    "FAILED",
    "FAILURE",
    "BOUNCED",
    "DECLINED",
    "ERROR",
  ]);


/* =========================================================
   ACCESS EXTEND PRESETS
========================================================= */

const EXTEND_PRESETS = [
  {
    label: "1 hour",
    hours: 1,
  },

  {
    label: "6 hours",
    hours: 6,
  },

  {
    label: "12 hours",
    hours: 12,
  },

  {
    label: "24 hours",
    hours: 24,
  },

  {
    label: "48 hours",
    hours: 48,
  },

  {
    label: "72 hours",
    hours: 72,
  },

  {
    label: "7 days",
    hours: 168,
  },
];


/* =========================================================
   THEME HELPER
========================================================= */

function getIsDarkTheme() {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }


  const storedTheme =
    String(
      window.localStorage.getItem(
        THEME_KEY
      ) || ""
    )
      .trim()
      .toLowerCase();


  if (
    storedTheme ===
    "dark"
  ) {
    return true;
  }


  if (
    storedTheme ===
    "light"
  ) {
    return false;
  }


  return (
    document.documentElement.classList.contains(
      "dark"
    ) ||

    document.documentElement.getAttribute(
      "data-theme"
    ) ===
      "dark"
  );
}


/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
  status
) {
  return String(
    status || ""
  )
    .trim()
    .toUpperCase();
}


/* =========================================================
   GET ALL STATUS VALUES
========================================================= */

function getOrderStatusValues(
  order
) {
  const values = [
    order?.payment?.status,

    order?.orderStatus,

    order?.payment
      ?.callbackResponse
      ?.status,

    order?.payment
      ?.callbackResponse
      ?.unmappedstatus,

    order?.payment
      ?.verificationResponse
      ?.status,

    order?.payment
      ?.verificationResponse
      ?.unmappedstatus,
  ];


  return values
    .map(
      normalizeStatus
    )
    .filter(
      Boolean
    );
}


/* =========================================================
   ORDER STATUS BUCKET

   Failed gets priority.

   This fixes cases where provider callback / payment /
   order status are not perfectly aligned.
========================================================= */

function getOrderBucket(
  order
) {
  const statuses =
    getOrderStatusValues(
      order
    );


  const hasFailedStatus =
    statuses.some(
      (
        status
      ) =>
        FAILED_STATUSES.has(
          status
        )
    );


  const hasFailedDate =
    Boolean(
      order?.payment?.failedAt
    );


  if (
    hasFailedStatus ||
    hasFailedDate
  ) {
    return "FAILED";
  }


  const hasSuccessStatus =
    statuses.some(
      (
        status
      ) =>
        SUCCESS_STATUSES.has(
          status
        )
    );


  if (
    hasSuccessStatus
  ) {
    return "SUCCESS";
  }


  const hasPendingStatus =
    statuses.some(
      (
        status
      ) =>
        PENDING_STATUSES.has(
          status
        )
    );


  if (
    hasPendingStatus
  ) {
    return "PENDING";
  }


  return "OTHER";
}


/* =========================================================
   PRIMARY DISPLAY STATUS
========================================================= */

function getOrderPrimaryStatus(
  order
) {
  const bucket =
    getOrderBucket(
      order
    );


  if (
    bucket !==
    "OTHER"
  ) {
    return bucket;
  }


  return (
    normalizeStatus(
      order?.payment?.status
    ) ||

    normalizeStatus(
      order?.orderStatus
    ) ||

    "UNKNOWN"
  );
}


/* =========================================================
   FILTER MATCH
========================================================= */

function matchesStatusFilter(
  order,
  filter
) {
  if (
    filter ===
    "ALL"
  ) {
    return true;
  }


  return (
    getOrderBucket(
      order
    ) ===
    filter
  );
}


/* =========================================================
   MONEY
========================================================= */

function money(
  value,
  currency = "INR"
) {
  if (
    value ===
      undefined ||

    value ===
      null ||

    value ===
      ""
  ) {
    return "—";
  }


  const amount =
    Number(
      value
    );


  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "—";
  }


  try {
    return new Intl
      .NumberFormat(
        currency ===
          "INR"
          ? "en-IN"
          : "en-US",
        {
          style:
            "currency",

          currency,

          maximumFractionDigits:
            2,
        }
      )
      .format(
        amount
      );
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  value
) {
  if (!value) {
    return "—";
  }


  const date =
    value instanceof Date
      ? value
      : new Date(
          value
        );


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return date.toLocaleString(
    "en-IN",
    {
      timeZone:
        "Asia/Kolkata",

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",

      second:
        "2-digit",

      hour12:
        true,
    }
  );
}


/* =========================================================
   YES / NO
========================================================= */

function yesNo(
  value
) {
  if (
    value ===
    true
  ) {
    return "Yes";
  }


  if (
    value ===
    false
  ) {
    return "No";
  }


  return "—";
}


/* =========================================================
   READ RESPONSE
========================================================= */

async function readResponse(
  response
) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}


/* =========================================================
   COPY VALUE
========================================================= */

function copyValue(
  value,
  label = "Value"
) {
  if (
    value ===
      undefined ||

    value ===
      null ||

    value ===
      ""
  ) {
    toast.error(
      `${label} is unavailable.`
    );

    return;
  }


  navigator.clipboard
    ?.writeText(
      String(
        value
      )
    )
    .then(
      () => {
        toast.success(
          `${label} copied`
        );
      }
    )
    .catch(
      () => {
        toast.error(
          "Unable to copy."
        );
      }
    );
}


/* =========================================================
   ACCESS STATE
========================================================= */

function getAccessState(
  order,
  now =
    Date.now()
) {
  const access =
    order?.access ||
    {};


  if (
    access.revoked ===
    true
  ) {
    return {
      key:
        "REVOKED",

      label:
        "Revoked",

      description:
        "Customer access has been manually revoked.",
    };
  }


  if (
    !access.expiresAt
  ) {
    return {
      key:
        "NONE",

      label:
        "Not Generated",

      description:
        "No secure access expiry is available for this order.",
    };
  }


  const expiry =
    new Date(
      access.expiresAt
    );


  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return {
      key:
        "UNKNOWN",

      label:
        "Unknown",

      description:
        "The stored access expiry is invalid.",
    };
  }


  if (
    expiry.getTime() <=
    now
  ) {
    return {
      key:
        "EXPIRED",

      label:
        "Expired",

      description:
        "The current book access period has expired.",
    };
  }


  return {
    key:
      "ACTIVE",

    label:
      "Active",

    description:
      "Customer currently has valid secure book access.",
  };
}


/* =========================================================
   REMAINING TIME
========================================================= */

function getRemainingTime(
  expiresAt,
  now =
    Date.now()
) {
  if (
    !expiresAt
  ) {
    return "No expiry";
  }


  const expiry =
    new Date(
      expiresAt
    );


  if (
    Number.isNaN(
      expiry.getTime()
    )
  ) {
    return "Invalid expiry";
  }


  const difference =
    expiry.getTime() -
    now;


  if (
    difference <=
    0
  ) {
    const elapsed =
      Math.abs(
        difference
      );


    const days =
      Math.floor(
        elapsed /
          86400000
      );


    const hours =
      Math.floor(
        elapsed /
          3600000
      );


    const minutes =
      Math.max(
        1,

        Math.floor(
          elapsed /
            60000
        )
      );


    if (
      days >
      0
    ) {
      return `Expired ${days}d ago`;
    }


    if (
      hours >
      0
    ) {
      return `Expired ${hours}h ago`;
    }


    return `Expired ${minutes}m ago`;
  }


  const totalMinutes =
    Math.ceil(
      difference /
        60000
    );


  const days =
    Math.floor(
      totalMinutes /
        1440
    );


  const hours =
    Math.floor(
      (
        totalMinutes %
        1440
      ) /
        60
    );


  const minutes =
    totalMinutes %
    60;


  if (
    days >
    0
  ) {
    return `${days}d ${hours}h remaining`;
  }


  if (
    hours >
    0
  ) {
    return `${hours}h ${minutes}m remaining`;
  }


  return `${Math.max(
    minutes,
    1
  )}m remaining`;
}


/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}) {
  const normalized =
    normalizeStatus(
      status
    );


  let type =
    "neutral";


  if (
    FAILED_STATUSES.has(
      normalized
    ) ||
    normalized ===
      "FAILED"
  ) {
    type =
      "failed";
  } else if (
    PENDING_STATUSES.has(
      normalized
    ) ||
    normalized ===
      "PENDING"
  ) {
    type =
      "pending";
  } else if (
    SUCCESS_STATUSES.has(
      normalized
    ) ||
    normalized ===
      "SUCCESS"
  ) {
    type =
      "success";
  }


  const Icon =
    type ===
    "success"
      ? CheckCircle2
      : type ===
        "pending"
      ? Clock3
      : type ===
        "failed"
      ? XCircle
      : Activity;


  return (
    <span
      className={`tt-status tt-status-${type}`}
    >
      <Icon
        className="h-3 w-3"
      />

      {normalized ||
        "UNKNOWN"}
    </span>
  );
}


/* =========================================================
   ACCESS BADGE
========================================================= */

function AccessBadge({
  state,
}) {
  const Icon =
    state.key ===
    "ACTIVE"
      ? UnlockKeyhole
      : state.key ===
        "REVOKED"
      ? LockKeyhole
      : state.key ===
        "EXPIRED"
      ? TimerReset
      : KeyRound;


  return (
    <span
      className={`tt-access-badge tt-access-${state.key.toLowerCase()}`}
    >
      <Icon
        className="h-3 w-3"
      />

      {state.label}
    </span>
  );
}


/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  icon: Icon,

  label,

  value,

  helper,

  tone =
    "blue",
}) {
  return (
    <div
      className="tt-card p-4"
    >
      <div
        className="flex items-start justify-between gap-3"
      >
        <div
          className="min-w-0"
        >
          <p
            className="tt-label"
          >
            {label}
          </p>


          <p
            className="tt-summary-value"
          >
            {value}
          </p>


          {helper ? (
            <p
              className="tt-helper mt-1"
            >
              {helper}
            </p>
          ) : null}
        </div>


        <div
          className={`tt-summary-icon tt-summary-${tone}`}
        >
          <Icon
            className="h-5 w-5"
          />
        </div>
      </div>
    </div>
  );
}


/* =========================================================
   DATA ITEM
========================================================= */

function DataItem({
  label,

  value,

  copy = false,

  mono = false,

  children,
}) {
  const hasValue =
    value !==
      undefined &&

    value !==
      null &&

    value !==
      "";


  return (
    <div
      className="tt-data-item"
    >
      <p
        className="tt-label"
      >
        {label}
      </p>


      <div
        className="mt-1.5 flex min-w-0 items-start justify-between gap-2"
      >
        <div
          className="min-w-0"
        >
          {children || (
            <p
              className={`tt-data-value ${
                mono
                  ? "font-mono text-[11px]"
                  : ""
              }`}
            >
              {hasValue
                ? String(
                    value
                  )
                : "—"}
            </p>
          )}
        </div>


        {copy &&
        hasValue ? (
          <button
            type="button"

            onClick={() =>
              copyValue(
                value,
                label
              )
            }

            className="tt-copy-button"
          >
            <Copy
              className="h-3.5 w-3.5"
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}


/* =========================================================
   ACCESS PANEL
========================================================= */

function AccessPanel({
  order,

  nowMs,
}) {
  const access =
    order?.access ||
    {};


  const state =
    getAccessState(
      order,
      nowMs
    );


  return (
    <section
      className={`tt-access-panel tt-access-panel-${state.key.toLowerCase()}`}
    >
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
      >
        <div
          className="flex items-start gap-3"
        >
          <div
            className="tt-access-icon"
          >
            <KeyRound
              className="h-5 w-5"
            />
          </div>


          <div>
            <div
              className="flex flex-wrap items-center gap-2"
            >
              <h3
                className="font-black"
              >
                Secure Book Access
              </h3>


              <AccessBadge
                state={
                  state
                }
              />
            </div>


            <p
              className="tt-helper mt-1"
            >
              {state.description}
            </p>
          </div>
        </div>


        <div
          className="tt-access-window"
        >
          <p
            className="tt-label"
          >
            Access Window
          </p>


          <p
            className="mt-1 text-xs font-black"
          >
            {getRemainingTime(
              access.expiresAt,
              nowMs
            )}
          </p>
        </div>
      </div>


      <div
        className="mt-4 grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        <DataItem
          label="Expires At"

          value={
            formatDate(
              access.expiresAt
            )
          }
        />


        <DataItem
          label="Generated At"

          value={
            formatDate(
              access.generatedAt
            )
          }
        />


        <DataItem
          label="Last Accessed"

          value={
            formatDate(
              access.lastAccessedAt
            )
          }
        />


        <DataItem
          label="Access Count"

          value={
            Number(
              access.accessCount ||
              0
            )
          }
        />
      </div>
    </section>
  );
}


/* =========================================================
   JSON ACCORDION
========================================================= */

function JsonAccordion({
  label,

  value,
}) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );


  return (
    <div
      className="tt-card overflow-hidden"
    >
      <button
        type="button"

        onClick={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }

        className="tt-accordion-button"
      >
        <div>
          <p
            className="text-xs font-extrabold"
          >
            {label}
          </p>


          <p
            className="tt-helper mt-0.5"
          >
            {value
              ? "View provider payload"
              : "No payload available"}
          </p>
        </div>


        {open ? (
          <ChevronUp
            className="h-4 w-4"
          />
        ) : (
          <ChevronDown
            className="h-4 w-4"
          />
        )}
      </button>


      {open ? (
        <div
          className="tt-json-container"
        >
          <pre
            className="max-h-80 overflow-auto whitespace-pre-wrap break-all text-[11px] leading-5"
          >
            {value
              ? JSON.stringify(
                  value,
                  null,
                  2
                )
              : "No data available"}
          </pre>
        </div>
      ) : null}
    </div>
  );
}


/* =========================================================
   ACTION MENU
========================================================= */

function ActionMenu({
  order,

  open,

  onToggle,

  onPending,

  onAccess,

  onEbookPdfs,

  onExtend,

  onRevoke,

  onReviewLink,

  onReviewMail,

  onDelete,

  sendingAccess,

  sendingEbook,

  extending,

  revoking,

  generatingReview,

  sendingReview,

  nowMs,
}) {
  const bucket =
    getOrderBucket(
      order
    );


  const isPaidSuccess =
    bucket ===
      "SUCCESS" &&

    normalizeStatus(
      order?.orderStatus
    ) ===
      "PAID";


  const accessState =
    getAccessState(
      order,
      nowMs
    );


  const hasAccess =
    Boolean(
      order?.access
        ?.generatedAt ||

      order?.access
        ?.expiresAt
    );


  return (
    <div
      className="relative"

      onClick={
        (
          event
        ) =>
          event.stopPropagation()
      }
    >
      <button
        type="button"

        onClick={
          onToggle
        }

        className="tt-btn tt-btn-secondary"
      >
        <MoreHorizontal
          className="h-4 w-4"
        />

        Manage

        <ChevronDown
          className={`h-3.5 w-3.5 transition ${
            open
              ? "rotate-180"
              : ""
          }`}
        />
      </button>


      {open ? (
        <div
          className="tt-action-menu"
        >
          <div
            className="tt-menu-heading"
          >
            Order Actions
          </div>


          {bucket ===
            "FAILED" ||
          bucket ===
            "PENDING" ? (
            <button
              type="button"

              onClick={() =>
                onPending(
                  order
                )
              }

              className="tt-menu-item"
            >
              <Mail
                className="h-4 w-4"
              />

              Send Purchase Reminder
            </button>
          ) : null}


          {isPaidSuccess ? (
            <>
              <button
                type="button"

                disabled={
                  sendingAccess ||

                  accessState.key ===
                    "REVOKED"
                }

                onClick={() =>
                  onAccess(
                    order
                  )
                }

                className="tt-menu-item"
              >
                {sendingAccess ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Send
                    className="h-4 w-4"
                  />
                )}

                Send Book Access
              </button>


              <button
                type="button"

                disabled={
                  sendingEbook ||

                  order.ebookEmail?.status ===
                    "SENDING"
                }

                onClick={() =>
                  onEbookPdfs(
                    order
                  )
                }

                title={
                  order.ebookEmail?.lastError
                    ? `Last error: ${order.ebookEmail.lastError}`
                    : undefined
                }

                className="tt-menu-item"
              >
                {sendingEbook ||
                order.ebookEmail?.status ===
                  "SENDING" ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Mail
                    className="h-4 w-4"
                  />
                )}

                {order.ebookEmail?.status ===
                "SENT"
                  ? "Resend Ebook PDFs (sent)"
                  : order.ebookEmail?.status ===
                      "FAILED" ||
                    order.ebookEmail?.status ===
                      "PARTIAL"
                  ? "Retry Ebook PDFs (failed)"
                  : "Email Ebook PDFs"}
              </button>


              <button
                type="button"

                disabled={
                  extending ||

                  !hasAccess
                }

                onClick={() =>
                  onExtend(
                    order
                  )
                }

                className="tt-menu-item tt-menu-success"
              >
                {extending ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <TimerReset
                    className="h-4 w-4"
                  />
                )}

                {accessState.key ===
                "REVOKED"
                  ? "Reactivate / Extend Access"
                  : "Extend Access"}
              </button>


              <button
                type="button"

                disabled={
                  revoking ||

                  !hasAccess ||

                  accessState.key ===
                    "REVOKED"
                }

                onClick={() =>
                  onRevoke(
                    order
                  )
                }

                className="tt-menu-item tt-menu-danger"
              >
                {revoking ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <ShieldOff
                    className="h-4 w-4"
                  />
                )}

                Revoke Book Access
              </button>


              <div
                className="tt-menu-divider"
              />


              <button
                type="button"

                disabled={
                  generatingReview
                }

                onClick={() =>
                  onReviewLink(
                    order
                  )
                }

                className="tt-menu-item"
              >
                {generatingReview ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Link2
                    className="h-4 w-4"
                  />
                )}

                Generate Review Link
              </button>


              <button
                type="button"

                disabled={
                  sendingReview
                }

                onClick={() =>
                  onReviewMail(
                    order
                  )
                }

                className="tt-menu-item"
              >
                {sendingReview ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <MessageSquareText
                    className="h-4 w-4"
                  />
                )}

                Send Review Email
              </button>
            </>
          ) : null}


          <div
            className="tt-menu-divider"
          />


          <button
            type="button"

            onClick={() =>
              onDelete(
                order
              )
            }

            className="tt-menu-item tt-menu-danger"
          >
            <Trash2
              className="h-4 w-4"
            />

            Delete Payment
          </button>
        </div>
      ) : null}
    </div>
  );
}


/* =========================================================
   PAYMENT CARD
========================================================= */

function PaymentCard({
  order,

  index,

  currency,

  menuOpen,

  onToggleMenu,

  onPending,

  onAccess,

  onEbookPdfs,

  onExtend,

  onRevoke,

  onReviewLink,

  onReviewMail,

  onDelete,

  sendingAccess,

  sendingEbook,

  extending,

  revoking,

  generatingReview,

  sendingReview,

  nowMs,
}) {
  const [
    expanded,
    setExpanded,
  ] =
    useState(
      false
    );


  const payment =
    order?.payment ||
    {};


  const customer =
    order?.customer ||
    {};


  const book =
    order?.book ||
    {};


  const coupon =
    order?.coupon ||
    {};


  const refund =
    order?.refund ||
    {};


  const reminder =
    order?.pendingMail ||
    {};


  const verification =
    order?.verification ||
    {};


  const metadata =
    order?.metadata ||
    {};


  const orderCurrency =
    book.currency ||

    currency ||

    "INR";


  const displayAmount =
    payment.amount ??

    coupon.finalAmount ??

    book.price;


  const primaryStatus =
    getOrderPrimaryStatus(
      order
    );


  const accessState =
    getAccessState(
      order,
      nowMs
    );


  return (
    <article
      className="tt-card overflow-visible"
    >
      <div
        className="tt-payment-header"
      >
        <div
          className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"
        >
          <div
            className="flex min-w-0 items-start gap-4"
          >
            <div
              className="tt-index"
            >
              {index}
            </div>


            <div
              className="min-w-0"
            >
              <div
                className="flex flex-wrap items-center gap-2"
              >
                <h2
                  className="truncate text-lg font-black"
                >
                  {customer.name ||
                    "Customer"}
                </h2>


                <StatusBadge
                  status={
                    primaryStatus
                  }
                />


                <AccessBadge
                  state={
                    accessState
                  }
                />
              </div>


              <p
                className="tt-muted mt-1 break-all text-sm font-semibold"
              >
                {customer.email ||
                  "No customer email"}
              </p>


              <div
                className="tt-subtle mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-semibold"
              >
                <span
                  className="inline-flex items-center gap-1"
                >
                  <Hash
                    className="h-3 w-3"
                  />

                  {order.orderId ||
                    "No Order ID"}
                </span>


                <span
                  className="inline-flex items-center gap-1"
                >
                  <CalendarDays
                    className="h-3 w-3"
                  />

                  {formatDate(
                    order.createdAt
                  )}
                </span>
              </div>
            </div>
          </div>


          <div
            className="flex flex-wrap items-center gap-2"
          >
            <div
              className="tt-small-stat"
            >
              <p
                className="tt-label"
              >
                Amount
              </p>


              <p
                className="mt-1 text-lg font-black"
              >
                {money(
                  displayAmount,
                  orderCurrency
                )}
              </p>
            </div>


            <div
              className="tt-small-stat"
            >
              <p
                className="tt-label"
              >
                Provider
              </p>


              <p
                className="mt-1 text-sm font-black"
              >
                {payment.provider ||
                  "—"}
              </p>
            </div>


            <ActionMenu
              order={
                order
              }

              open={
                menuOpen
              }

              onToggle={
                onToggleMenu
              }

              onPending={
                onPending
              }

              onAccess={
                onAccess
              }

              onEbookPdfs={
                onEbookPdfs
              }

              onExtend={
                onExtend
              }

              onRevoke={
                onRevoke
              }

              onReviewLink={
                onReviewLink
              }

              onReviewMail={
                onReviewMail
              }

              onDelete={
                onDelete
              }

              sendingAccess={
                sendingAccess
              }

              sendingEbook={
                sendingEbook
              }

              extending={
                extending
              }

              revoking={
                revoking
              }

              generatingReview={
                generatingReview
              }

              sendingReview={
                sendingReview
              }

              nowMs={
                nowMs
              }
            />
          </div>
        </div>
      </div>


      <div
        className="space-y-4 p-5 sm:p-6"
      >
        <AccessPanel
          order={
            order
          }

          nowMs={
            nowMs
          }
        />


        <div
          className="grid grid-cols-2 gap-2 md:grid-cols-4"
        >
          <DataItem
            label="Payment ID"

            value={
              payment.paymentId
            }

            copy

            mono
          />


          <DataItem
            label="Transaction ID"

            value={
              payment.transactionId
            }

            copy

            mono
          />


          <DataItem
            label="Payment Method"

            value={
              payment.method
            }
          />


          <DataItem
            label="Affiliate"

            value={
              payment.affiliateCode ||
              "Direct / none"
            }
          />
        </div>


        <button
          type="button"

          onClick={() =>
            setExpanded(
              (
                current
              ) =>
                !current
            )
          }

          className="tt-expand-button"
        >
          <div>
            <p
              className="font-extrabold"
            >
              {expanded
                ? "Hide Complete Details"
                : "View Complete Details"}
            </p>


            <p
              className="tt-helper mt-0.5"
            >
              Customer, payment, coupon, refund,
              verification and provider information
            </p>
          </div>


          {expanded ? (
            <ChevronUp
              className="h-4 w-4"
            />
          ) : (
            <ChevronDown
              className="h-4 w-4"
            />
          )}
        </button>


        {expanded ? (
          <div
            className="space-y-4 border-t pt-4"

            style={{
              borderColor:
                "var(--tt-border)",
            }}
          >
            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <UserRound
                    className="h-4 w-4"
                  />

                  Customer & Order
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="Name"

                    value={
                      customer.name
                    }
                  />


                  <DataItem
                    label="Email"

                    value={
                      customer.email
                    }

                    copy
                  />


                  <DataItem
                    label="Phone"

                    value={
                      customer.phone
                    }

                    copy
                  />


                  <DataItem
                    label="Mongo ID"

                    value={
                      order._id
                    }

                    copy

                    mono
                  />


                  <DataItem
                    label="Order Status"
                  >
                    <StatusBadge
                      status={
                        order.orderStatus
                      }
                    />
                  </DataItem>


                  <DataItem
                    label="Created By"

                    value={
                      order.createdBy
                    }
                  />


                  <DataItem
                    label="Created At"

                    value={
                      formatDate(
                        order.createdAt
                      )
                    }
                  />


                  <DataItem
                    label="Updated At"

                    value={
                      formatDate(
                        order.updatedAt
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <CreditCard
                    className="h-4 w-4"
                  />

                  Payment Details
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="Provider"

                    value={
                      payment.provider
                    }
                  />


                  <DataItem
                    label="Status"
                  >
                    <StatusBadge
                      status={
                        payment.status
                      }
                    />
                  </DataItem>


                  <DataItem
                    label="Amount"

                    value={
                      money(
                        payment.amount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Method"

                    value={
                      payment.method
                    }
                  />


                  <DataItem
                    label="Paid At"

                    value={
                      formatDate(
                        payment.paidAt
                      )
                    }
                  />


                  <DataItem
                    label="Failed At"

                    value={
                      formatDate(
                        payment.failedAt
                      )
                    }
                  />


                  <DataItem
                    label="Payment ID"

                    value={
                      payment.paymentId
                    }

                    copy

                    mono
                  />


                  <DataItem
                    label="Transaction ID"

                    value={
                      payment.transactionId
                    }

                    copy

                    mono
                  />
                </div>
              </section>
            </div>


            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-3"
            >
              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <BadgePercent
                    className="h-4 w-4"
                  />

                  Coupon
                </div>


                <div
                  className="space-y-2"
                >
                  <DataItem
                    label="Applied"

                    value={
                      yesNo(
                        coupon.applied
                      )
                    }
                  />


                  <DataItem
                    label="Code"

                    value={
                      coupon.code
                    }

                    copy
                  />


                  <DataItem
                    label="Original Amount"

                    value={
                      money(
                        coupon.originalAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Discount"

                    value={
                      money(
                        coupon.discountAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Final Amount"

                    value={
                      money(
                        coupon.finalAmount,
                        orderCurrency
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <RotateCcw
                    className="h-4 w-4"
                  />

                  Refund
                </div>


                <div
                  className="space-y-2"
                >
                  <DataItem
                    label="Status"
                  >
                    <StatusBadge
                      status={
                        refund.status ||
                        "NOT_REQUESTED"
                      }
                    />
                  </DataItem>


                  <DataItem
                    label="Requested"

                    value={
                      money(
                        refund.requestedAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Refunded"

                    value={
                      money(
                        refund.refundedAmount,
                        orderCurrency
                      )
                    }
                  />


                  <DataItem
                    label="Remaining"

                    value={
                      money(
                        refund.remainingAmount,
                        orderCurrency
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <ShieldCheck
                    className="h-4 w-4"
                  />

                  Verification
                </div>


                <div
                  className="space-y-2"
                >
                  <DataItem
                    label="Callback Hash"

                    value={
                      yesNo(
                        verification.callbackHashVerified
                      )
                    }
                  />


                  <DataItem
                    label="PayU Verified"

                    value={
                      yesNo(
                        verification.payuVerified
                      )
                    }
                  />


                  <DataItem
                    label="Amount Verified"

                    value={
                      yesNo(
                        verification.amountVerified
                      )
                    }
                  />


                  <DataItem
                    label="Verified At"

                    value={
                      formatDate(
                        verification.verifiedAt
                      )
                    }
                  />
                </div>
              </section>
            </div>


            <div
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <Mail
                    className="h-4 w-4"
                  />

                  Reminder Email
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="Sent Count"

                    value={
                      Number(
                        reminder.sentCount ||
                        0
                      )
                    }
                  />


                  <DataItem
                    label="Last Status"

                    value={
                      reminder.lastStatus ||
                      "NOT_SENT"
                    }
                  />


                  <DataItem
                    label="First Sent"

                    value={
                      formatDate(
                        reminder.firstSentAt
                      )
                    }
                  />


                  <DataItem
                    label="Last Sent"

                    value={
                      formatDate(
                        reminder.lastSentAt
                      )
                    }
                  />
                </div>
              </section>


              <section
                className="tt-detail-section"
              >
                <div
                  className="tt-section-title"
                >
                  <Globe2
                    className="h-4 w-4"
                  />

                  Request Metadata
                </div>


                <div
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  <DataItem
                    label="IP Address"

                    value={
                      metadata.ipAddress
                    }

                    copy

                    mono
                  />


                  <DataItem
                    label="Referrer"

                    value={
                      metadata.referrer
                    }
                  />


                  <DataItem
                    label="UTM Source"

                    value={
                      metadata.utmSource
                    }
                  />


                  <DataItem
                    label="UTM Medium"

                    value={
                      metadata.utmMedium
                    }
                  />


                  <DataItem
                    label="UTM Campaign"

                    value={
                      metadata.utmCampaign
                    }
                  />
                </div>
              </section>
            </div>


            <div
              className="grid grid-cols-1 gap-3 lg:grid-cols-2"
            >
              <JsonAccordion
                label="PayU Callback Response"

                value={
                  payment.callbackResponse
                }
              />


              <JsonAccordion
                label="PayU Verification Response"

                value={
                  payment.verificationResponse
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}


/* =========================================================
   MODAL
========================================================= */

function Modal({
  children,

  maxWidth =
    "max-w-lg",
}) {
  return (
    <div
      className="tt-modal-backdrop"
    >
      <div
        className={`tt-modal ${maxWidth}`}
      >
        {children}
      </div>
    </div>
  );
}


/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({
  icon: Icon,

  title,

  subtitle,

  onClose,

  tone =
    "blue",
}) {
  return (
    <div
      className="tt-modal-header"
    >
      <div
        className="flex items-start gap-3"
      >
        <div
          className={`tt-modal-icon tt-modal-icon-${tone}`}
        >
          <Icon
            className="h-5 w-5"
          />
        </div>


        <div>
          <h2
            className="text-xl font-black"
          >
            {title}
          </h2>


          {subtitle ? (
            <p
              className="tt-helper mt-1"
            >
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>


      <button
        type="button"

        onClick={
          onClose
        }

        className="tt-icon-button"
      >
        <X
          className="h-4 w-4"
        />
      </button>
    </div>
  );
}


/* =========================================================
   BUSINESS BREAKDOWN
========================================================= */

function BreakdownPanel({
  breakdown,

  currency,
}) {
  const [
    open,
    setOpen,
  ] =
    useState(
      false
    );


  const groups = [
    {
      title:
        "Payment Status",

      items:
        breakdown.paymentStatus ||
        [],

      label:
        (
          item
        ) =>
          item.status ||
          "Unknown",

      value:
        (
          item
        ) =>
          `${item.count || 0} • ${money(
            item.amount ||
              0,
            currency
          )}`,
    },

    {
      title:
        "Order Status",

      items:
        breakdown.orderStatus ||
        [],

      label:
        (
          item
        ) =>
          item.status ||
          "Unknown",

      value:
        (
          item
        ) =>
          `${item.count || 0} orders`,
    },

    {
      title:
        "Coupons",

      items:
        breakdown.coupons ||
        [],

      label:
        (
          item
        ) =>
          item.code ||
          "No code",

      value:
        (
          item
        ) =>
          `${item.uses || 0} uses • ${money(
            item.totalDiscountAmount ||
              0,
            currency
          )}`,
    },

    {
      title:
        "Affiliates",

      items:
        breakdown.affiliates ||
        [],

      label:
        (
          item
        ) =>
          item.affiliateCode ||
          "Direct / none",

      value:
        (
          item
        ) =>
          `${item.orders || 0} orders • ${money(
            item.amount ||
              0,
            currency
          )}`,
    },
  ];


  return (
    <section
      className="tt-card overflow-hidden"
    >
      <button
        type="button"

        onClick={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }

        className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div
          className="flex items-center gap-3"
        >
          <div
            className="tt-summary-icon tt-summary-blue"
          >
            <Activity
              className="h-5 w-5"
            />
          </div>


          <div>
            <h2
              className="font-black"
            >
              Business Breakdown
            </h2>


            <p
              className="tt-helper mt-0.5"
            >
              Payment, order, coupon and affiliate distribution
            </p>
          </div>
        </div>


        {open ? (
          <ChevronUp
            className="h-5 w-5 tt-muted"
          />
        ) : (
          <ChevronDown
            className="h-5 w-5 tt-muted"
          />
        )}
      </button>


      {open ? (
        <div
          className="grid grid-cols-1 gap-4 border-t p-5 sm:p-6 lg:grid-cols-2 xl:grid-cols-4"

          style={{
            borderColor:
              "var(--tt-border)",
          }}
        >
          {groups.map(
            (
              group
            ) => (
              <div
                key={
                  group.title
                }

                className="tt-soft-card p-4"
              >
                <p
                  className="font-black"
                >
                  {group.title}
                </p>


                <div
                  className="mt-3 space-y-2"
                >
                  {group.items.length ? (
                    group.items.map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={`${group.title}-${index}`}

                          className="tt-breakdown-row"
                        >
                          <span
                            className="truncate font-bold"
                          >
                            {group.label(
                              item
                            )}
                          </span>


                          <span
                            className="tt-subtle shrink-0 text-[10px] font-extrabold"
                          >
                            {group.value(
                              item
                            )}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p
                      className="tt-helper"
                    >
                      No data
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      ) : null}
    </section>
  );
}


/* =========================================================
   MAIN PAGE
========================================================= */

export default function AdminBookPayments() {
  const navigate =
    useNavigate();


  const {
    bookId,
  } =
    useParams();


  const token =
    useSelector(
      (
        state
      ) =>
        state.auth.token
    );


  /* =======================================================
     THEME
  ======================================================= */

  const [
    isDark,
    setIsDark,
  ] =
    useState(
      () =>
        getIsDarkTheme()
    );


  /* =======================================================
     DATA
  ======================================================= */

  const [
    book,
    setBook,
  ] =
    useState(
      null
    );


  const [
    summary,
    setSummary,
  ] =
    useState(
      EMPTY_SUMMARY
    );


  const [
    breakdown,
    setBreakdown,
  ] =
    useState({
      paymentStatus: [],

      orderStatus: [],

      refundStatus: [],

      coupons: [],

      affiliates: [],
    });


  const [
    payments,
    setPayments,
  ] =
    useState(
      []
    );


  /*
   * Used when status filter/search
   * needs records from every page.
   */
  const [
    allPayments,
    setAllPayments,
  ] =
    useState(
      []
    );


  const [
    allPaymentsLoaded,
    setAllPaymentsLoaded,
  ] =
    useState(
      false
    );


  const [
    loadingAllPayments,
    setLoadingAllPayments,
  ] =
    useState(
      false
    );


  const [
    pagination,
    setPagination,
  ] =
    useState({
      enabled: true,

      page: 1,

      limit: 10,

      totalItems: 0,

      totalPages: 1,

      returnedItems: 0,

      hasNextPage: false,

      hasPreviousPage: false,
    });


  const [
    page,
    setPage,
  ] =
    useState(
      1
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );


  const [
    error,
    setError,
  ] =
    useState(
      ""
    );


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState(
      "ALL"
    );


  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState(
      ""
    );


  const [
    menuOrderId,
    setMenuOrderId,
  ] =
    useState(
      null
    );


  const [
    nowMs,
    setNowMs,
  ] =
    useState(
      Date.now()
    );


  /* =======================================================
     REMINDER MAIL
  ======================================================= */

  const [
    pendingOrder,
    setPendingOrder,
  ] =
    useState(
      null
    );


  const [
    couponCode,
    setCouponCode,
  ] =
    useState(
      ""
    );


  const [
    couponDescription,
    setCouponDescription,
  ] =
    useState(
      ""
    );


  const [
    sendingMail,
    setSendingMail,
  ] =
    useState(
      false
    );


  /* =======================================================
     ACCESS
  ======================================================= */

  const [
    sendingAccessOrderId,
    setSendingAccessOrderId,
  ] =
    useState(
      null
    );


  const [
    sendingEbookOrderId,
    setSendingEbookOrderId,
  ] =
    useState(
      null
    );


  const [
    extendOrder,
    setExtendOrder,
  ] =
    useState(
      null
    );


  const [
    extendHours,
    setExtendHours,
  ] =
    useState(
      "24"
    );


  const [
    extendingAccessOrderId,
    setExtendingAccessOrderId,
  ] =
    useState(
      null
    );


  const [
    revokeOrder,
    setRevokeOrder,
  ] =
    useState(
      null
    );


  const [
    revokingAccessOrderId,
    setRevokingAccessOrderId,
  ] =
    useState(
      null
    );


  /* =======================================================
     REVIEW
  ======================================================= */

  const [
    generatingReviewOrderId,
    setGeneratingReviewOrderId,
  ] =
    useState(
      null
    );


  const [
    sendingReviewMailOrderId,
    setSendingReviewMailOrderId,
  ] =
    useState(
      null
    );


  const [
    reviewLinkModal,
    setReviewLinkModal,
  ] =
    useState(
      null
    );


  /* =======================================================
     DELETE
  ======================================================= */

  const [
    deleteOrder,
    setDeleteOrder,
  ] =
    useState(
      null
    );


  const [
    deletingPayment,
    setDeletingPayment,
  ] =
    useState(
      false
    );


  /* =======================================================
     NAVBAR THEME SYNC
  ======================================================= */

  useEffect(
    () => {
      const syncTheme =
        (
          event
        ) => {
          const detail =
            event?.detail;


          const eventTheme =
            typeof detail ===
              "string"
              ? detail
              : detail?.theme;


          if (
            eventTheme ===
            "dark"
          ) {
            setIsDark(
              true
            );

            return;
          }


          if (
            eventTheme ===
            "light"
          ) {
            setIsDark(
              false
            );

            return;
          }


          setIsDark(
            getIsDarkTheme()
          );
        };


      syncTheme();


      /*
       * Same-tab navbar change.
       */
      window.addEventListener(
        THEME_EVENT,
        syncTheme
      );


      /*
       * Other tabs.
       */
      window.addEventListener(
        "storage",
        syncTheme
      );


      /*
       * Also monitor html class/data-theme.
       */
      const observer =
        new MutationObserver(
          syncTheme
        );


      observer.observe(
        document.documentElement,
        {
          attributes:
            true,

          attributeFilter: [
            "class",
            "data-theme",
          ],
        }
      );


      return () => {
        window.removeEventListener(
          THEME_EVENT,
          syncTheme
        );


        window.removeEventListener(
          "storage",
          syncTheme
        );


        observer.disconnect();
      };
    },
    []
  );


  /* =======================================================
     ACCESS TIMER
  ======================================================= */

  useEffect(
    () => {
      const timer =
        window.setInterval(
          () => {
            setNowMs(
              Date.now()
            );
          },
          30000
        );


      return () =>
        window.clearInterval(
          timer
        );
    },
    []
  );


  /* =======================================================
     FETCH CURRENT PAGE
  ======================================================= */

  const fetchPayments =
    useCallback(
      async (
        requestedPage =
          page,

        signal =
          undefined
      ) => {
        try {
          if (
            !bookId ||
            !token
          ) {
            return;
          }


          setLoading(
            true
          );


          setError(
            ""
          );


          const response =
            await fetch(
              `${BASE_URL}/admin/books/${encodeURIComponent(
                bookId
              )}/payments/page/${requestedPage}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",

                  Authorization:
                    `Bearer ${token}`,
                },

                signal,
              }
            );


          const result =
            await readResponse(
              response
            );


          if (
            !response.ok ||

            result?.success !==
              true
          ) {
            throw new Error(
              result?.message ||

              "Unable to load payment details."
            );
          }


          const data =
            result?.data ||
            {};


          const rawSummary =
            data.summary ||
            {};


          setBook(
            data.book ||
            null
          );


          setSummary({
            ...EMPTY_SUMMARY,

            ...rawSummary,

            payments: {
              ...EMPTY_SUMMARY.payments,

              ...(
                rawSummary.payments ||
                {}
              ),
            },

            refunds: {
              ...EMPTY_SUMMARY.refunds,

              ...(
                rawSummary.refunds ||
                {}
              ),
            },

            coupons: {
              ...EMPTY_SUMMARY.coupons,

              ...(
                rawSummary.coupons ||
                {}
              ),
            },

            reminderMails: {
              ...EMPTY_SUMMARY.reminderMails,

              ...(
                rawSummary.reminderMails ||
                {}
              ),
            },

            access: {
              ...EMPTY_SUMMARY.access,

              ...(
                rawSummary.access ||
                {}
              ),
            },

            verification: {
              ...EMPTY_SUMMARY.verification,

              ...(
                rawSummary.verification ||
                {}
              ),
            },

            affiliates: {
              ...EMPTY_SUMMARY.affiliates,

              ...(
                rawSummary.affiliates ||
                {}
              ),
            },
          });


          setBreakdown({
            paymentStatus:
              data?.breakdown
                ?.paymentStatus ||
              [],

            orderStatus:
              data?.breakdown
                ?.orderStatus ||
              [],

            refundStatus:
              data?.breakdown
                ?.refundStatus ||
              [],

            coupons:
              data?.breakdown
                ?.coupons ||
              [],

            affiliates:
              data?.breakdown
                ?.affiliates ||
              [],
          });


          setPayments(
            Array.isArray(
              data.payments
            )
              ? data.payments
              : []
          );


          setPagination({
            enabled: true,

            page:
              requestedPage,

            limit: 10,

            totalItems: 0,

            totalPages: 1,

            returnedItems: 0,

            hasNextPage: false,

            hasPreviousPage: false,

            ...(
              data.pagination ||
              {}
            ),
          });


          /*
           * Invalidate all-page cache because
           * database could have changed.
           */
          setAllPayments(
            []
          );


          setAllPaymentsLoaded(
            false
          );

        } catch (
          error
        ) {
          if (
            error?.name ===
            "AbortError"
          ) {
            return;
          }


          console.error(
            "Fetch payments error:",
            error
          );


          setError(
            error?.message ||

            "Unable to load payments."
          );

        } finally {
          if (
            !signal?.aborted
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        bookId,
        token,
        page,
      ]
    );


  /* =======================================================
     FETCH ALL PAGES FOR FILTER / SEARCH
  ======================================================= */

  const fetchAllPayments =
    useCallback(
      async () => {
        if (
          !bookId ||
          !token ||
          allPaymentsLoaded ||
          loadingAllPayments
        ) {
          return;
        }


        try {
          setLoadingAllPayments(
            true
          );


          const totalPages =
            Math.max(
              Number(
                pagination.totalPages
              ) ||
                1,

              1
            );


          /*
           * If one page only,
           * no extra requests.
           */
          if (
            totalPages ===
            1
          ) {
            setAllPayments(
              payments
            );


            setAllPaymentsLoaded(
              true
            );


            return;
          }


          const pageNumbers =
            Array.from(
              {
                length:
                  totalPages,
              },
              (
                _,
                index
              ) =>
                index +
                1
            );


          const responses =
            await Promise.all(
              pageNumbers.map(
                (
                  currentPage
                ) =>
                  fetch(
                    `${BASE_URL}/admin/books/${encodeURIComponent(
                      bookId
                    )}/payments/page/${currentPage}`,
                    {
                      method:
                        "GET",

                      headers: {
                        Accept:
                          "application/json",

                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  )
              )
            );


          const results =
            await Promise.all(
              responses.map(
                async (
                  response
                ) => {
                  const result =
                    await readResponse(
                      response
                    );


                  if (
                    !response.ok ||

                    result?.success !==
                      true
                  ) {
                    throw new Error(
                      result?.message ||

                      "Unable to load all payment records."
                    );
                  }


                  return result;
                }
              )
            );


          const combined =
            results.flatMap(
              (
                result
              ) => {
                const list =
                  result?.data
                    ?.payments;


                return Array.isArray(
                  list
                )
                  ? list
                  : [];
              }
            );


          /*
           * Remove duplicates.
           */
          const map =
            new Map();


          combined.forEach(
            (
              order
            ) => {
              const key =
                order?._id ||

                order?.orderId;


              if (
                key
              ) {
                map.set(
                  key,
                  order
                );
              }
            }
          );


          setAllPayments(
            Array.from(
              map.values()
            )
          );


          setAllPaymentsLoaded(
            true
          );

        } catch (
          error
        ) {
          console.error(
            "Fetch all payments error:",
            error
          );


          toast.error(
            error?.message ||

            "Unable to load all payments for filtering."
          );

        } finally {
          setLoadingAllPayments(
            false
          );
        }
      },
      [
        bookId,
        token,
        pagination.totalPages,
        payments,
        allPaymentsLoaded,
        loadingAllPayments,
      ]
    );


  /* =======================================================
     LOAD CURRENT PAGE
  ======================================================= */

  useEffect(
    () => {
      const controller =
        new AbortController();


      fetchPayments(
        page,
        controller.signal
      );


      return () =>
        controller.abort();
    },
    [
      page,
      fetchPayments,
    ]
  );


  /* =======================================================
     GLOBAL FILTER MODE

     ALL:
     use current backend page.

     Success/Pending/Failed/Search:
     load all backend pages.
  ======================================================= */

  const isGlobalFilterMode =
    statusFilter !==
      "ALL" ||

    Boolean(
      searchQuery.trim()
    );


  useEffect(
    () => {
      if (
        !isGlobalFilterMode ||

        loading ||

        allPaymentsLoaded ||

        loadingAllPayments
      ) {
        return;
      }


      fetchAllPayments();
    },
    [
      isGlobalFilterMode,
      loading,
      allPaymentsLoaded,
      loadingAllPayments,
      fetchAllPayments,
    ]
  );


  /* =======================================================
     CLOSE MENU
  ======================================================= */

  useEffect(
    () => {
      const closeMenu =
        () =>
          setMenuOrderId(
            null
          );


      document.addEventListener(
        "click",
        closeMenu
      );


      return () =>
        document.removeEventListener(
          "click",
          closeMenu
        );
    },
    []
  );


  useEffect(
    () => {
      setMenuOrderId(
        null
      );
    },
    [
      statusFilter,
      searchQuery,
    ]
  );


  /* =======================================================
     FILTER COUNTS
  ======================================================= */

  const filterCounts =
    useMemo(
      () => ({
        ALL:
          summary.totalOrders ||

          pagination.totalItems ||

          0,

        SUCCESS:
          summary.payments
            .successfulPayments ||
          0,

        PENDING:
          summary.payments
            .pendingPayments ||
          0,

        FAILED:
          summary.payments
            .failedPayments ||
          0,
      }),
      [
        summary,
        pagination.totalItems,
      ]
    );


  /* =======================================================
     VISIBLE PAYMENTS
  ======================================================= */

  const visiblePayments =
    useMemo(
      () => {
        const normalizedSearch =
          searchQuery
            .trim()
            .toLowerCase();


        /*
         * IMPORTANT:
         *
         * Status filters/search use ALL pages.
         * ALL view keeps backend pagination.
         */
        const source =
          isGlobalFilterMode
            ? allPayments
            : payments;


        return source.filter(
          (
            order
          ) => {
            if (
              !matchesStatusFilter(
                order,
                statusFilter
              )
            ) {
              return false;
            }


            if (
              !normalizedSearch
            ) {
              return true;
            }


            const searchable =
              [
                order?._id,

                order?.orderId,

                order?.customer
                  ?.name,

                order?.customer
                  ?.email,

                order?.customer
                  ?.phone,

                order?.book
                  ?.title,

                order?.payment
                  ?.transactionId,

                order?.payment
                  ?.paymentId,

                order?.payment
                  ?.provider,

                order?.payment
                  ?.affiliateCode,

                order?.payment
                  ?.method,

                order?.payment
                  ?.status,

                order?.orderStatus,

                order?.coupon
                  ?.code,
              ]
                .filter(
                  Boolean
                )
                .join(
                  " "
                )
                .toLowerCase();


            return searchable.includes(
              normalizedSearch
            );
          }
        );
      },
      [
        payments,
        allPayments,
        isGlobalFilterMode,
        statusFilter,
        searchQuery,
      ]
    );


  /* =======================================================
     OPEN PENDING MODAL
  ======================================================= */

  const openPendingModal =
    (
      order
    ) => {
      setMenuOrderId(
        null
      );


      setPendingOrder(
        order
      );


      setCouponCode(
        ""
      );


      setCouponDescription(
        ""
      );
    };


  /* =======================================================
     SEND PENDING / FAILED REMINDER
  ======================================================= */

  const handleSendPendingMail =
    async () => {
      if (
        !pendingOrder?._id
      ) {
        return;
      }


      const code =
        couponCode.trim();


      const description =
        couponDescription.trim();


      if (
        Boolean(
          code
        ) !==
        Boolean(
          description
        )
      ) {
        toast.error(
          "Enter both coupon code and coupon description, or leave both empty."
        );

        return;
      }


      const toastId =
        toast.loading(
          "Sending purchase reminder..."
        );


      try {
        setSendingMail(
          true
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              pendingOrder._id
            )}/send-pending-mail`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify(
                  code
                    ? {
                        couponCode:
                          code,

                        couponDescription:
                          description,
                      }
                    : {}
                ),
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send purchase reminder."
          );
        }


        toast.success(
          result?.message ||

          "Purchase reminder sent successfully.",
          {
            id:
              toastId,
          }
        );


        setPendingOrder(
          null
        );


        setCouponCode(
          ""
        );


        setCouponDescription(
          ""
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Send reminder error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to send purchase reminder.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setSendingMail(
          false
        );
      }
    };


  /* =======================================================
     SEND BOOK ACCESS
  ======================================================= */

  const handleSendAccessMail =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        toast.error(
          "Order ID is missing."
        );

        return;
      }


      if (
        getOrderBucket(
          order
        ) !==
          "SUCCESS" ||

        normalizeStatus(
          order.orderStatus
        ) !==
          "PAID"
      ) {
        toast.error(
          "Book access can only be sent for a successful paid order."
        );

        return;
      }


      if (
        order.access?.revoked ===
        true
      ) {
        toast.error(
          "Reactivate this access before sending the access email."
        );

        return;
      }


      setMenuOrderId(
        null
      );


      const toastId =
        toast.loading(
          `Sending book access to ${
            order.customer?.email ||
            "customer"
          }...`
        );


      try {
        setSendingAccessOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              order._id
            )}/resend-book-access`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send book access email."
          );
        }


        toast.success(
          result?.message ||

          "Book access email sent successfully.",
          {
            id:
              toastId,
          }
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Book access error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to send book access email.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setSendingAccessOrderId(
          null
        );
      }
    };


  /* =======================================================
     EMAIL EBOOK PDFs (sent in the background by the server)
  ======================================================= */

  const handleSendEbookPdfs =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        toast.error(
          "Order ID is missing."
        );

        return;
      }


      setMenuOrderId(
        null
      );


      try {
        setSendingEbookOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              order._id
            )}/send-ebook-pdfs`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send ebook PDFs."
          );
        }


        toast.success(
          result?.message ||

          "Ebook PDFs are being emailed."
        );


        /* The server sends in the background; refresh
           the status shortly and again after a while. */
        setTimeout(
          () =>
            fetchPayments(
              page
            ),
          4000
        );

        setTimeout(
          () =>
            fetchPayments(
              page
            ),
          30000
        );

      } catch (
        error
      ) {
        toast.error(
          error?.message ||

          "Unable to send ebook PDFs."
        );

      } finally {
        setSendingEbookOrderId(
          null
        );
      }
    };


  /* =======================================================
     OPEN EXTEND
  ======================================================= */

  const openExtendAccess =
    (
      order
    ) => {
      setMenuOrderId(
        null
      );


      setExtendOrder(
        order
      );


      setExtendHours(
        "24"
      );
    };


  /* =======================================================
     EXTEND / REACTIVATE ACCESS
  ======================================================= */

  const handleExtendAccess =
    async () => {
      if (
        !extendOrder?._id
      ) {
        return;
      }


      const hours =
        Number(
          extendHours
        );


      if (
        !Number.isInteger(
          hours
        ) ||

        hours <=
        0
      ) {
        toast.error(
          "Hours must be a positive whole number."
        );

        return;
      }


      const wasRevoked =
        extendOrder.access
          ?.revoked ===
        true;


      const toastId =
        toast.loading(
          wasRevoked
            ? "Reactivating access..."
            : "Extending access..."
        );


      try {
        setExtendingAccessOrderId(
          extendOrder._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              extendOrder._id
            )}/access/extend`,
            {
              method:
                "PATCH",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },

              body:
                JSON.stringify({
                  hours,
                }),
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to update book access."
          );
        }


        toast.success(
          result?.message ||

          (
            wasRevoked
              ? "Book access reactivated successfully."
              : "Book access extended successfully."
          ),
          {
            id:
              toastId,
          }
        );


        setExtendOrder(
          null
        );


        setExtendHours(
          "24"
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Extend access error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to update book access.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setExtendingAccessOrderId(
          null
        );
      }
    };


  /* =======================================================
     REVOKE ACCESS
  ======================================================= */

  const handleRevokeAccess =
    async () => {
      if (
        !revokeOrder?._id
      ) {
        return;
      }


      const toastId =
        toast.loading(
          "Revoking book access..."
        );


      try {
        setRevokingAccessOrderId(
          revokeOrder._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/admin/notification/orders/${encodeURIComponent(
              revokeOrder._id
            )}/access/revoke`,
            {
              method:
                "PATCH",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to revoke book access."
          );
        }


        toast.success(
          result?.message ||

          "Book access revoked successfully.",
          {
            id:
              toastId,
          }
        );


        setRevokeOrder(
          null
        );


        await fetchPayments(
          page
        );

      } catch (
        error
      ) {
        console.error(
          "Revoke access error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to revoke book access.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setRevokingAccessOrderId(
          null
        );
      }
    };


  /* =======================================================
     GENERATE REVIEW LINK
  ======================================================= */

  const handleGenerateReviewLink =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        return;
      }


      setMenuOrderId(
        null
      );


      const toastId =
        toast.loading(
          "Generating review link..."
        );


      try {
        setGeneratingReviewOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/book/review/admin/order/${encodeURIComponent(
              order._id
            )}/link`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to generate review link."
          );
        }


        const reviewUrl =
          result?.data
            ?.reviewUrl;


        if (
          !reviewUrl
        ) {
          throw new Error(
            "Review URL was not returned by the server."
          );
        }


        setReviewLinkModal({
          reviewUrl,

          alreadyGenerated:
            Boolean(
              result?.data
                ?.alreadyGenerated
            ),

          customerName:
            order.customer
              ?.name ||
            "Customer",

          customerEmail:
            order.customer
              ?.email ||
            "",

          orderId:
            order.orderId ||
            order._id,

          bookTitle:
            order.book
              ?.title ||

            book?.title ||

            "Book",
        });


        toast.success(
          result?.message ||

          "Review link generated successfully.",
          {
            id:
              toastId,
          }
        );

      } catch (
        error
      ) {
        console.error(
          "Review link error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to generate review link.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setGeneratingReviewOrderId(
          null
        );
      }
    };


  /* =======================================================
     SEND REVIEW MAIL
  ======================================================= */

  const handleSendReviewMail =
    async (
      order
    ) => {
      if (
        !order?._id
      ) {
        return;
      }


      setMenuOrderId(
        null
      );


      const toastId =
        toast.loading(
          "Sending review email..."
        );


      try {
        setSendingReviewMailOrderId(
          order._id
        );


        const response =
          await fetch(
            `${BASE_URL}/api/book/review/admin/order/${encodeURIComponent(
              order._id
            )}/send-mail`,
            {
              method:
                "POST",

              headers: {
                Accept:
                  "application/json",

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to send review email."
          );
        }


        toast.success(
          result?.message ||

          "Review email sent successfully.",
          {
            id:
              toastId,
          }
        );

      } catch (
        error
      ) {
        console.error(
          "Review email error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to send review email.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setSendingReviewMailOrderId(
          null
        );
      }
    };


  /* =======================================================
     DELETE PAYMENT
  ======================================================= */

  const handleDeletePayment =
    async () => {
      if (
        !deleteOrder?._id
      ) {
        return;
      }


      const toastId =
        toast.loading(
          "Deleting payment record..."
        );


      try {
        setDeletingPayment(
          true
        );


        const response =
          await fetch(
            `${BASE_URL}/admin/books/${encodeURIComponent(
              bookId
            )}/payments/${encodeURIComponent(
              deleteOrder._id
            )}`,
            {
              method:
                "DELETE",

              headers: {
                Accept:
                  "application/json",

                Authorization:
                  `Bearer ${token}`,
              },
            }
          );


        const result =
          await readResponse(
            response
          );


        if (
          !response.ok ||

          result?.success ===
            false
        ) {
          throw new Error(
            result?.message ||

            "Unable to delete payment."
          );
        }


        toast.success(
          result?.message ||

          "Payment deleted successfully.",
          {
            id:
              toastId,
          }
        );


        setDeleteOrder(
          null
        );


        if (
          payments.length ===
            1 &&

          page >
            1
        ) {
          setPage(
            (
              current
            ) =>
              current -
              1
          );
        } else {
          await fetchPayments(
            page
          );
        }

      } catch (
        error
      ) {
        console.error(
          "Delete payment error:",
          error
        );


        toast.error(
          error?.message ||

          "Unable to delete payment.",
          {
            id:
              toastId,
          }
        );

      } finally {
        setDeletingPayment(
          false
        );
      }
    };


  /* =======================================================
     PAGINATION
  ======================================================= */

  const goToPage =
    (
      nextPage
    ) => {
      const totalPages =
        Math.max(
          Number(
            pagination.totalPages
          ) ||
            1,

          1
        );


      if (
        nextPage <
          1 ||

        nextPage >
          totalPages ||

        nextPage ===
          page ||

        loading
      ) {
        return;
      }


      setPage(
        nextPage
      );


      setMenuOrderId(
        null
      );


      window.scrollTo({
        top:
          0,

        behavior:
          "smooth",
      });
    };


  const currency =
    book?.currency ||
    "INR";


  return (
    <div
      className="tt-payments"

      data-theme={
        isDark
          ? "dark"
          : "light"
      }
    >
      <Helmet>
        <title>
          {book?.title
            ? `${book.title} Payments | Target Trek Admin`
            : "Book Payments | Target Trek Admin"}
        </title>


        <meta
          name="robots"
          content="noindex, nofollow, noarchive, nosnippet"
        />


        <meta
          name="googlebot"
          content="noindex, nofollow, noarchive, nosnippet"
        />


        <meta
          name="theme-color"
          content={
            isDark
              ? "#020617"
              : "#f8fafc"
          }
        />
      </Helmet>


      <style>{`

        .tt-payments {
          color-scheme: light;

          --tt-bg: #f8fafc;
          --tt-surface: #ffffff;
          --tt-surface-soft: #f8fafc;
          --tt-surface-muted: #f1f5f9;

          --tt-text: #0f172a;
          --tt-text-secondary: #334155;

          --tt-muted: #64748b;
          --tt-subtle: #94a3b8;

          --tt-border: #e2e8f0;
          --tt-border-soft: #f1f5f9;

          --tt-primary: #2563eb;
          --tt-primary-hover: #1d4ed8;
          --tt-primary-soft: #eff6ff;

          --tt-success: #059669;
          --tt-success-soft: #ecfdf5;
          --tt-success-border: #a7f3d0;

          --tt-warning: #d97706;
          --tt-warning-soft: #fffbeb;
          --tt-warning-border: #fde68a;

          --tt-danger: #dc2626;
          --tt-danger-soft: #fef2f2;
          --tt-danger-border: #fecaca;

          --tt-violet: #7c3aed;
          --tt-violet-soft: #f5f3ff;

          --tt-overlay:
            rgba(2, 6, 23, 0.68);

          --tt-shadow:
            0 1px 2px rgba(15, 23, 42, 0.04),
            0 8px 24px rgba(15, 23, 42, 0.05);
        }


        .tt-payments[data-theme="dark"] {
          color-scheme: dark;

          --tt-bg: #020617;
          --tt-surface: #0f172a;
          --tt-surface-soft: #111827;
          --tt-surface-muted: #1e293b;

          --tt-text: #f8fafc;
          --tt-text-secondary: #e2e8f0;

          --tt-muted: #94a3b8;
          --tt-subtle: #64748b;

          --tt-border: #1e293b;
          --tt-border-soft: #172033;

          --tt-primary: #60a5fa;
          --tt-primary-hover: #93c5fd;
          --tt-primary-soft:
            rgba(37, 99, 235, 0.15);

          --tt-success: #34d399;
          --tt-success-soft:
            rgba(5, 150, 105, 0.15);
          --tt-success-border:
            rgba(52, 211, 153, 0.3);

          --tt-warning: #fbbf24;
          --tt-warning-soft:
            rgba(217, 119, 6, 0.15);
          --tt-warning-border:
            rgba(251, 191, 36, 0.3);

          --tt-danger: #f87171;
          --tt-danger-soft:
            rgba(220, 38, 38, 0.15);
          --tt-danger-border:
            rgba(248, 113, 113, 0.3);

          --tt-violet: #a78bfa;
          --tt-violet-soft:
            rgba(124, 58, 237, 0.15);

          --tt-overlay:
            rgba(0, 0, 0, 0.76);

          --tt-shadow:
            0 15px 45px rgba(0, 0, 0, 0.28);
        }


        .tt-page {
          min-height: 100vh;
          background: var(--tt-bg);
          color: var(--tt-text);

          transition:
            background-color 180ms ease,
            color 180ms ease;
        }


        .tt-card {
          border:
            1px solid
            var(--tt-border);

          border-radius: 1.5rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          box-shadow:
            var(--tt-shadow);
        }


        .tt-soft-card {
          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface-soft);

          color:
            var(--tt-text);
        }


        .tt-muted {
          color:
            var(--tt-muted);
        }


        .tt-subtle {
          color:
            var(--tt-subtle);
        }


        .tt-helper {
          color:
            var(--tt-muted);

          font-size:
            0.75rem;

          line-height:
            1.35rem;

          font-weight:
            500;
        }


        .tt-label {
          color:
            var(--tt-subtle);

          font-size:
            9px;

          font-weight:
            800;

          letter-spacing:
            0.1em;

          text-transform:
            uppercase;
        }


        .tt-summary-value {
          margin-top:
            0.4rem;

          color:
            var(--tt-text);

          font-size:
            1.25rem;

          font-weight:
            900;

          word-break:
            break-word;
        }


        .tt-summary-icon {
          display:
            flex;

          width:
            2.5rem;

          height:
            2.5rem;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.8rem;
        }


        .tt-summary-blue {
          color:
            var(--tt-primary);

          background:
            var(--tt-primary-soft);
        }


        .tt-summary-emerald {
          color:
            var(--tt-success);

          background:
            var(--tt-success-soft);
        }


        .tt-summary-amber {
          color:
            var(--tt-warning);

          background:
            var(--tt-warning-soft);
        }


        .tt-summary-red {
          color:
            var(--tt-danger);

          background:
            var(--tt-danger-soft);
        }


        .tt-summary-violet {
          color:
            var(--tt-violet);

          background:
            var(--tt-violet-soft);
        }


        .tt-summary-slate {
          color:
            var(--tt-text-secondary);

          background:
            var(--tt-surface-muted);
        }


        .tt-hero {
          border:
            1px solid
            var(--tt-border);

          border-radius:
            1.6rem;

          background:
            linear-gradient(
              135deg,
              var(--tt-primary-soft),
              var(--tt-surface) 50%,
              var(--tt-violet-soft)
            );

          box-shadow:
            var(--tt-shadow);
        }


        .tt-btn {
          display:
            inline-flex;

          min-height:
            40px;

          align-items:
            center;

          justify-content:
            center;

          gap:
            0.5rem;

          border-radius:
            0.75rem;

          padding:
            0.55rem 0.9rem;

          font-size:
            0.8rem;

          font-weight:
            800;

          transition:
            all 150ms ease;
        }


        .tt-btn:disabled {
          cursor:
            not-allowed;

          opacity:
            0.48;
        }


        .tt-btn-secondary {
          border:
            1px solid
            var(--tt-border);

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);
        }


        .tt-btn-secondary:hover:not(:disabled) {
          border-color:
            var(--tt-primary);

          color:
            var(--tt-primary);
        }


        .tt-btn-primary {
          border:
            1px solid
            var(--tt-primary);

          background:
            var(--tt-primary);

          color:
            white;
        }


        .tt-btn-success {
          border:
            1px solid
            var(--tt-success);

          background:
            var(--tt-success);

          color:
            white;
        }


        .tt-btn-danger {
          border:
            1px solid
            var(--tt-danger);

          background:
            var(--tt-danger);

          color:
            white;
        }


        .tt-input,
        .tt-textarea {
          width:
            100%;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          outline:
            none;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          font-size:
            0.875rem;

          font-weight:
            600;
        }


        .tt-input {
          height:
            44px;

          padding:
            0 0.85rem;
        }


        .tt-textarea {
          padding:
            0.85rem;

          resize:
            vertical;
        }


        .tt-input::placeholder,
        .tt-textarea::placeholder {
          color:
            var(--tt-subtle);
        }


        .tt-input:focus,
        .tt-textarea:focus {
          border-color:
            var(--tt-primary);

          box-shadow:
            0 0 0 3px
            var(--tt-primary-soft);
        }


        .tt-payment-header {
          padding:
            1.25rem;

          border-bottom:
            1px solid
            var(--tt-border-soft);

          border-radius:
            1.5rem
            1.5rem
            0
            0;

          background:
            linear-gradient(
              90deg,
              var(--tt-surface-soft),
              var(--tt-surface),
              var(--tt-primary-soft)
            );
        }


        .tt-index {
          display:
            flex;

          width:
            44px;

          height:
            44px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.9rem;

          background:
            var(--tt-text);

          color:
            var(--tt-surface);

          font-size:
            0.85rem;

          font-weight:
            900;
        }


        .tt-small-stat {
          min-width:
            112px;

          padding:
            0.65rem
            0.85rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.8rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          box-shadow:
            var(--tt-shadow);
        }


        .tt-status,
        .tt-access-badge {
          display:
            inline-flex;

          align-items:
            center;

          gap:
            0.3rem;

          padding:
            0.26rem
            0.55rem;

          border-radius:
            999px;

          border:
            1px solid;

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.07em;

          text-transform:
            uppercase;
        }


        .tt-status-success,
        .tt-access-active {
          color:
            var(--tt-success);

          border-color:
            var(--tt-success-border);

          background:
            var(--tt-success-soft);
        }


        .tt-status-pending,
        .tt-access-expired {
          color:
            var(--tt-warning);

          border-color:
            var(--tt-warning-border);

          background:
            var(--tt-warning-soft);
        }


        .tt-status-failed,
        .tt-access-revoked {
          color:
            var(--tt-danger);

          border-color:
            var(--tt-danger-border);

          background:
            var(--tt-danger-soft);
        }


        .tt-status-neutral,
        .tt-access-none,
        .tt-access-unknown {
          color:
            var(--tt-muted);

          border-color:
            var(--tt-border);

          background:
            var(--tt-surface-muted);
        }


        .tt-access-panel {
          padding:
            1rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface-soft);
        }


        .tt-access-panel-active {
          border-color:
            var(--tt-success-border);

          background:
            var(--tt-success-soft);
        }


        .tt-access-panel-expired {
          border-color:
            var(--tt-warning-border);

          background:
            var(--tt-warning-soft);
        }


        .tt-access-panel-revoked {
          border-color:
            var(--tt-danger-border);

          background:
            var(--tt-danger-soft);
        }


        .tt-access-icon {
          display:
            flex;

          width:
            40px;

          height:
            40px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);
        }


        .tt-access-window {
          padding:
            0.6rem
            0.8rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);
        }


        .tt-data-item {
          min-width:
            0;

          padding:
            0.7rem
            0.8rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);
        }


        .tt-data-value {
          color:
            var(--tt-text-secondary);

          font-size:
            0.8rem;

          line-height:
            1.2rem;

          font-weight:
            700;

          word-break:
            break-word;
        }


        .tt-copy-button {
          display:
            flex;

          width:
            28px;

          height:
            28px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.5rem;

          color:
            var(--tt-subtle);
        }


        .tt-copy-button:hover {
          background:
            var(--tt-surface-muted);

          color:
            var(--tt-primary);
        }


        .tt-expand-button {
          display:
            flex;

          width:
            100%;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            1rem;

          padding:
            0.8rem
            1rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface-soft);

          color:
            var(--tt-text-secondary);

          text-align:
            left;
        }


        .tt-expand-button:hover {
          border-color:
            var(--tt-primary);
        }


        .tt-detail-section {
          padding:
            1rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface);
        }


        .tt-section-title {
          display:
            flex;

          align-items:
            center;

          gap:
            0.5rem;

          margin-bottom:
            0.8rem;

          color:
            var(--tt-text);

          font-size:
            0.85rem;

          font-weight:
            900;
        }


        .tt-accordion-button {
          display:
            flex;

          width:
            100%;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            1rem;

          padding:
            0.8rem
            1rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);

          text-align:
            left;
        }


        .tt-accordion-button:hover {
          background:
            var(--tt-surface-soft);
        }


        .tt-json-container {
          padding:
            1rem;

          border-top:
            1px solid
            var(--tt-border);

          background:
            #020617;

          color:
            #e2e8f0;
        }


        .tt-action-menu {
          position:
            absolute;

          right:
            0;

          top:
            48px;

          z-index:
            80;

          width:
            290px;

          overflow:
            hidden;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1rem;

          background:
            var(--tt-surface);

          box-shadow:
            0 24px 60px
            rgba(2, 6, 23, 0.25);
        }


        .tt-menu-heading {
          padding:
            0.65rem
            0.9rem;

          border-bottom:
            1px solid
            var(--tt-border-soft);

          color:
            var(--tt-subtle);

          font-size:
            9px;

          font-weight:
            900;

          letter-spacing:
            0.1em;

          text-transform:
            uppercase;
        }


        .tt-menu-item {
          display:
            flex;

          width:
            100%;

          align-items:
            center;

          gap:
            0.75rem;

          padding:
            0.78rem
            0.9rem;

          background:
            transparent;

          color:
            var(--tt-text-secondary);

          font-size:
            0.82rem;

          font-weight:
            800;

          text-align:
            left;
        }


        .tt-menu-item:hover:not(:disabled) {
          background:
            var(--tt-primary-soft);

          color:
            var(--tt-primary);
        }


        .tt-menu-item:disabled {
          cursor:
            not-allowed;

          opacity:
            0.4;
        }


        .tt-menu-success:hover:not(:disabled) {
          background:
            var(--tt-success-soft);

          color:
            var(--tt-success);
        }


        .tt-menu-danger {
          color:
            var(--tt-danger);
        }


        .tt-menu-danger:hover:not(:disabled) {
          background:
            var(--tt-danger-soft);

          color:
            var(--tt-danger);
        }


        .tt-menu-divider {
          margin:
            0
            0.75rem;

          border-top:
            1px solid
            var(--tt-border-soft);
        }


        .tt-breakdown-row {
          display:
            flex;

          align-items:
            center;

          justify-content:
            space-between;

          gap:
            0.75rem;

          padding:
            0.55rem
            0.65rem;

          border-radius:
            0.65rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text-secondary);

          font-size:
            0.75rem;
        }


        .tt-modal-backdrop {
          position:
            fixed;

          inset:
            0;

          z-index:
            120;

          display:
            flex;

          align-items:
            center;

          justify-content:
            center;

          padding:
            1rem;

          background:
            var(--tt-overlay);

          backdrop-filter:
            blur(6px);
        }


        .tt-modal {
          width:
            100%;

          max-height:
            92vh;

          overflow-y:
            auto;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            1.5rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-text);

          box-shadow:
            0 30px 80px
            rgba(2, 6, 23, 0.35);
        }


        .tt-modal-header {
          display:
            flex;

          align-items:
            flex-start;

          justify-content:
            space-between;

          gap:
            1rem;

          padding:
            1.25rem;

          border-bottom:
            1px solid
            var(--tt-border-soft);
        }


        .tt-modal-icon {
          display:
            flex;

          width:
            44px;

          height:
            44px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.9rem;
        }


        .tt-modal-icon-blue {
          background:
            var(--tt-primary-soft);

          color:
            var(--tt-primary);
        }


        .tt-modal-icon-emerald {
          background:
            var(--tt-success-soft);

          color:
            var(--tt-success);
        }


        .tt-modal-icon-red {
          background:
            var(--tt-danger-soft);

          color:
            var(--tt-danger);
        }


        .tt-modal-icon-violet {
          background:
            var(--tt-violet-soft);

          color:
            var(--tt-violet);
        }


        .tt-icon-button {
          display:
            flex;

          width:
            36px;

          height:
            36px;

          flex-shrink:
            0;

          align-items:
            center;

          justify-content:
            center;

          border-radius:
            0.65rem;

          color:
            var(--tt-muted);
        }


        .tt-icon-button:hover {
          background:
            var(--tt-surface-muted);

          color:
            var(--tt-text);
        }


        .tt-filter-button {
          display:
            inline-flex;

          min-height:
            40px;

          align-items:
            center;

          gap:
            0.45rem;

          padding:
            0.5rem
            0.8rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          background:
            var(--tt-surface);

          color:
            var(--tt-muted);

          font-size:
            0.75rem;

          font-weight:
            900;
        }


        .tt-filter-button:hover {
          border-color:
            var(--tt-primary);

          color:
            var(--tt-primary);
        }


        .tt-filter-button-active {
          border-color:
            var(--tt-text);

          background:
            var(--tt-text);

          color:
            var(--tt-surface);
        }


        .tt-filter-count {
          padding:
            0.08rem
            0.4rem;

          border-radius:
            999px;

          background:
            var(--tt-surface-muted);

          color:
            var(--tt-muted);

          font-size:
            9px;
        }


        .tt-filter-button-active
        .tt-filter-count {
          background:
            rgba(148, 163, 184, 0.2);

          color:
            inherit;
        }


        .tt-search-wrapper {
          position:
            relative;

          width:
            100%;
        }


        .tt-search-icon {
          position:
            absolute;

          left:
            0.85rem;

          top:
            50%;

          width:
            16px;

          height:
            16px;

          transform:
            translateY(-50%);

          pointer-events:
            none;

          color:
            var(--tt-subtle);
        }


        .tt-search-input {
          width:
            100%;

          height:
            44px;

          padding:
            0
            0.9rem
            0
            2.6rem;

          border:
            1px solid
            var(--tt-border);

          border-radius:
            0.75rem;

          outline:
            none;

          background:
            var(--tt-surface-soft);

          color:
            var(--tt-text);

          font-size:
            0.82rem;

          font-weight:
            700;
        }


        .tt-search-input::placeholder {
          color:
            var(--tt-subtle);
        }


        .tt-search-input:focus {
          border-color:
            var(--tt-primary);

          background:
            var(--tt-surface);

          box-shadow:
            0 0 0 3px
            var(--tt-primary-soft);
        }


        @media (
          min-width: 640px
        ) {
          .tt-payment-header {
            padding:
              1.5rem;
          }


          .tt-modal-header {
            padding:
              1.5rem;
          }
        }

      `}</style>


      <main
        className="tt-page pt-24 sm:pt-28"
      >
        <div
          className="mx-auto max-w-[1560px] px-4 pb-20 sm:px-6 lg:px-8"
        >
          {/* =================================================
              TOP BAR
          ================================================= */}

          <div
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"

              onClick={() =>
                navigate(
                  `/admin/book/${bookId}`
                )
              }

              className="tt-muted inline-flex items-center gap-2 text-sm font-bold"
            >
              <ArrowLeft
                className="h-4 w-4"
              />

              Back to Book Details
            </button>


            <div
              className="flex flex-wrap gap-2"
            >
              <button
                type="button"

                onClick={() =>
                  navigate(
                    `/admin/book/${bookId}/reviews`
                  )
                }

                className="tt-btn tt-btn-primary"
              >
                <MessageSquareText
                  className="h-4 w-4"
                />

                Manage Reviews
              </button>


              <button
                type="button"

                disabled={
                  loading
                }

                onClick={() =>
                  fetchPayments(
                    page
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>


          {/* =================================================
              HERO
          ================================================= */}

          <section
            className="tt-hero mt-5 p-5 sm:p-7"
          >
            <div
              className="flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between"
            >
              <div
                className="flex min-w-0 items-start gap-4"
              >
                {book?.coverPageUrl ? (
                  <img
                    src={
                      book.coverPageUrl
                    }

                    alt={
                      book.title ||
                      "Book"
                    }

                    className="h-24 w-16 shrink-0 rounded-xl object-cover shadow-lg"
                  />
                ) : (
                  <div
                    className="tt-summary-icon tt-summary-blue h-14 w-14"
                  >
                    <ShoppingBag
                      className="h-7 w-7"
                    />
                  </div>
                )}


                <div
                  className="min-w-0"
                >
                  <p
                    className="tt-label"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  >
                    Revenue & Access Control
                  </p>


                  <h1
                    className="mt-1 max-w-4xl text-2xl font-black tracking-tight sm:text-3xl"
                  >
                    {book?.title ||
                      "Book Payments"}
                  </h1>


                  <p
                    className="tt-helper mt-3 max-w-3xl text-sm"
                  >
                    Manage payments, failed orders, purchase
                    reminders, coupons, refunds, access expiry,
                    access revocation and customer review requests.
                  </p>


                  <div
                    className="mt-3 flex flex-wrap gap-2"
                  >
                    {book?.slug ? (
                      <span
                        className="tt-soft-card px-2.5 py-1 text-[10px] font-bold"
                      >
                        /{book.slug}
                      </span>
                    ) : null}


                    <span
                      className="tt-soft-card px-2.5 py-1 text-[10px] font-bold"
                    >
                      Price{" "}

                      {money(
                        book?.price,
                        currency
                      )}
                    </span>


                    <span
                      className="tt-soft-card px-2.5 py-1 text-[10px] font-bold"
                    >
                      MRP{" "}

                      {money(
                        book?.mrp,
                        currency
                      )}
                    </span>
                  </div>
                </div>
              </div>


              <div
                className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:min-w-[570px]"
              >
                <SummaryCard
                  icon={
                    ShoppingBag
                  }

                  label="Orders"

                  value={
                    summary.totalOrders
                  }

                  helper={`${pagination.totalItems || 0} total`}

                  tone="slate"
                />


                <SummaryCard
                  icon={
                    CircleDollarSign
                  }

                  label="Net Revenue"

                  value={
                    money(
                      summary.payments
                        .netRevenue,
                      currency
                    )
                  }

                  helper={`${summary.payments.successfulPayments} success`}

                  tone="emerald"
                />


                <SummaryCard
                  icon={
                    KeyRound
                  }

                  label="Book Opens"

                  value={
                    summary.access
                      .totalAccessCount
                  }

                  helper={`${summary.access.revokedAccessOrders} revoked`}

                  tone="blue"
                />


                <SummaryCard
                  icon={
                    BadgePercent
                  }

                  label="Discounts"

                  value={
                    money(
                      summary.coupons
                        .totalDiscountAmount,
                      currency
                    )
                  }

                  helper={`${summary.coupons.couponAppliedOrders} coupon orders`}

                  tone="violet"
                />
              </div>
            </div>
          </section>


          {/* =================================================
              STATS
          ================================================= */}

          <section
            className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
          >
            <SummaryCard
              icon={
                CheckCircle2
              }

              label="Successful"

              value={
                summary.payments
                  .successfulPayments
              }

              helper={
                money(
                  summary.payments
                    .successfulAmount,
                  currency
                )
              }

              tone="emerald"
            />


            <SummaryCard
              icon={
                Clock3
              }

              label="Pending"

              value={
                summary.payments
                  .pendingPayments
              }

              helper={
                money(
                  summary.payments
                    .pendingAmount,
                  currency
                )
              }

              tone="amber"
            />


            <SummaryCard
              icon={
                XCircle
              }

              label="Failed"

              value={
                summary.payments
                  .failedPayments
              }

              helper={
                money(
                  summary.payments
                    .failedAmount,
                  currency
                )
              }

              tone="red"
            />


            <SummaryCard
              icon={
                RotateCcw
              }

              label="Refunded"

              value={
                money(
                  summary.refunds
                    .totalRefundedAmount,
                  currency
                )
              }

              helper={`${summary.refunds.refundOrders} orders`}

              tone="violet"
            />


            <SummaryCard
              icon={
                Mail
              }

              label="Reminders"

              value={
                summary.reminderMails
                  .totalSent
              }

              helper={`${summary.reminderMails.ordersWithReminderMail} orders`}

              tone="blue"
            />


            <SummaryCard
              icon={
                ShieldCheck
              }

              label="Verified"

              value={
                summary.verification
                  .payuVerified
              }

              helper="PayU verified"

              tone="slate"
            />
          </section>


          {/* =================================================
              BREAKDOWN
          ================================================= */}

          <div
            className="mt-4"
          >
            <BreakdownPanel
              breakdown={
                breakdown
              }

              currency={
                currency
              }
            />
          </div>


          {/* =================================================
              FILTERS / SEARCH
          ================================================= */}

          <section
            className="tt-card mt-5 p-4 sm:p-5"
          >
            <div
              className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between"
            >
              <div
                className="flex flex-wrap gap-2"
              >
                {FILTERS.map(
                  (
                    item
                  ) => {
                    const Icon =
                      item.icon;


                    const active =
                      statusFilter ===
                      item.key;


                    return (
                      <button
                        key={
                          item.key
                        }

                        type="button"

                        onClick={() => {
                          setStatusFilter(
                            item.key
                          );


                          setMenuOrderId(
                            null
                          );
                        }}

                        className={`tt-filter-button ${
                          active
                            ? "tt-filter-button-active"
                            : ""
                        }`}
                      >
                        <Icon
                          className="h-3.5 w-3.5"
                        />

                        {item.label}


                        <span
                          className="tt-filter-count"
                        >
                          {filterCounts[
                            item.key
                          ] ||
                            0}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>


              <div
                className="tt-search-wrapper xl:max-w-md"
              >
                <Search
                  className="tt-search-icon"
                />


                <input
                  value={
                    searchQuery
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setSearchQuery(
                        event.target.value
                      )
                  }

                  className="tt-search-input"

                  placeholder="Search customer, order, transaction, payment ID..."
                />
              </div>
            </div>


            {isGlobalFilterMode ? (
              <div
                className="tt-soft-card mt-4 px-4 py-3"
              >
                {loadingAllPayments &&
                !allPaymentsLoaded ? (
                  <div
                    className="flex items-center gap-2 text-sm font-bold"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  >
                    <Loader2
                      className="h-4 w-4 animate-spin"
                    />

                    Loading all payment pages...
                  </div>
                ) : (
                  <p
                    className="tt-helper"
                  >
                    Showing{" "}

                    <strong
                      style={{
                        color:
                          "var(--tt-text)",
                      }}
                    >
                      {visiblePayments.length}
                    </strong>{" "}

                    matching record
                    {visiblePayments.length ===
                    1
                      ? ""
                      : "s"}{" "}

                    across{" "}

                    <strong
                      style={{
                        color:
                          "var(--tt-text)",
                      }}
                    >
                      {pagination.totalItems ||
                        allPayments.length}
                    </strong>{" "}

                    total orders.
                  </p>
                )}
              </div>
            ) : null}
          </section>


          {/* =================================================
              ERROR
          ================================================= */}

          {error ? (
            <section
              className="mt-5 rounded-2xl border p-5"

              style={{
                borderColor:
                  "var(--tt-danger-border)",

                background:
                  "var(--tt-danger-soft)",

                color:
                  "var(--tt-danger)",
              }}
            >
              <div
                className="flex items-start gap-3"
              >
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"
                />


                <div>
                  <p
                    className="font-black"
                  >
                    Unable to load payments
                  </p>


                  <p
                    className="mt-1 text-sm font-semibold"
                  >
                    {error}
                  </p>
                </div>
              </div>
            </section>
          ) : null}


          {/* =================================================
              PAYMENT CARDS
          ================================================= */}

          <section
            className="mt-5 space-y-4"
          >
            {loading &&
            !payments.length ? (
              <div
                className="tt-card flex min-h-[320px] items-center justify-center"
              >
                <div
                  className="text-center"
                >
                  <Loader2
                    className="mx-auto h-7 w-7 animate-spin"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  />


                  <p
                    className="tt-muted mt-3 text-sm font-bold"
                  >
                    Loading payment records...
                  </p>
                </div>
              </div>
            ) : isGlobalFilterMode &&
              loadingAllPayments &&
              !allPaymentsLoaded ? (
              <div
                className="tt-card flex min-h-[240px] items-center justify-center"
              >
                <div
                  className="text-center"
                >
                  <Loader2
                    className="mx-auto h-7 w-7 animate-spin"

                    style={{
                      color:
                        "var(--tt-primary)",
                    }}
                  />


                  <p
                    className="tt-muted mt-3 text-sm font-bold"
                  >
                    Loading all orders for filtering...
                  </p>
                </div>
              </div>
            ) : visiblePayments.length ? (
              visiblePayments.map(
                (
                  order,
                  index
                ) => (
                  <PaymentCard
                    key={
                      order._id ||
                      order.orderId
                    }

                    order={
                      order
                    }

                    index={
                      isGlobalFilterMode
                        ? index +
                          1
                        : (
                            page -
                            1
                          ) *
                            (
                              pagination.limit ||
                              10
                            ) +
                          index +
                          1
                    }

                    currency={
                      currency
                    }

                    menuOpen={
                      menuOrderId ===
                      order._id
                    }

                    onToggleMenu={
                      (
                        event
                      ) => {
                        event.stopPropagation();


                        setMenuOrderId(
                          (
                            current
                          ) =>
                            current ===
                            order._id
                              ? null
                              : order._id
                        );
                      }
                    }

                    onPending={
                      openPendingModal
                    }

                    onAccess={
                      handleSendAccessMail
                    }

                    onEbookPdfs={
                      handleSendEbookPdfs
                    }

                    onExtend={
                      openExtendAccess
                    }

                    onRevoke={
                      (
                        selectedOrder
                      ) => {
                        setMenuOrderId(
                          null
                        );


                        setRevokeOrder(
                          selectedOrder
                        );
                      }
                    }

                    onReviewLink={
                      handleGenerateReviewLink
                    }

                    onReviewMail={
                      handleSendReviewMail
                    }

                    onDelete={
                      (
                        selectedOrder
                      ) => {
                        setMenuOrderId(
                          null
                        );


                        setDeleteOrder(
                          selectedOrder
                        );
                      }
                    }

                    sendingAccess={
                      sendingAccessOrderId ===
                      order._id
                    }

                    sendingEbook={
                      sendingEbookOrderId ===
                      order._id
                    }

                    extending={
                      extendingAccessOrderId ===
                      order._id
                    }

                    revoking={
                      revokingAccessOrderId ===
                      order._id
                    }

                    generatingReview={
                      generatingReviewOrderId ===
                      order._id
                    }

                    sendingReview={
                      sendingReviewMailOrderId ===
                      order._id
                    }

                    nowMs={
                      nowMs
                    }
                  />
                )
              )
            ) : (
              <div
                className="tt-card p-12 text-center"
              >
                <Receipt
                  className="tt-subtle mx-auto h-9 w-9"
                />


                <h3
                  className="mt-4 text-lg font-black"
                >
                  No payment records found
                </h3>


                <p
                  className="tt-helper mt-1"
                >
                  Try another filter or search query.
                </p>
              </div>
            )}
          </section>


          {/* =================================================
              PAGINATION

              Hide pagination when filtering because all
              backend pages are already combined.
          ================================================= */}

          {!isGlobalFilterMode ? (
            <section
              className="tt-card mt-5 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p
                className="tt-helper"
              >
                Page{" "}

                <strong
                  style={{
                    color:
                      "var(--tt-text)",
                  }}
                >
                  {pagination.page ||
                    page}
                </strong>{" "}

                of{" "}

                <strong
                  style={{
                    color:
                      "var(--tt-text)",
                  }}
                >
                  {Math.max(
                    Number(
                      pagination.totalPages
                    ) ||
                      1,
                    1
                  )}
                </strong>

                {" • "}

                {pagination.totalItems ||
                  0}{" "}
                records
              </p>


              <div
                className="flex gap-2"
              >
                <button
                  type="button"

                  disabled={
                    !pagination.hasPreviousPage ||

                    loading
                  }

                  onClick={() =>
                    goToPage(
                      page -
                        1
                    )
                  }

                  className="tt-btn tt-btn-secondary"
                >
                  <ChevronLeft
                    className="h-4 w-4"
                  />

                  Previous
                </button>


                <button
                  type="button"

                  disabled={
                    !pagination.hasNextPage ||

                    loading
                  }

                  onClick={() =>
                    goToPage(
                      page +
                        1
                    )
                  }

                  className="tt-btn tt-btn-secondary"
                >
                  Next

                  <ChevronRight
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </section>
          ) : null}
        </div>
      </main>


      {/* ===================================================
          SEND REMINDER MODAL
      =================================================== */}

      {pendingOrder ? (
        <Modal>
          <ModalHeader
            icon={
              Mail
            }

            title="Send Purchase Reminder"

            subtitle={
              pendingOrder.customer
                ?.email ||

              pendingOrder.orderId
            }

            onClose={() => {
              if (
                !sendingMail
              ) {
                setPendingOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <div
              className="tt-soft-card p-4"
            >
              <p
                className="font-black"
              >
                Optional Coupon
              </p>


              <p
                className="tt-helper mt-1"
              >
                Enter both coupon code and coupon description
                or leave both empty.
              </p>


              <div
                className="mt-4 space-y-3"
              >
                <input
                  value={
                    couponCode
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setCouponCode(
                        event.target.value
                      )
                  }

                  className="tt-input"

                  placeholder="Coupon code"
                />


                <textarea
                  rows={
                    3
                  }

                  value={
                    couponDescription
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setCouponDescription(
                        event.target.value
                      )
                  }

                  className="tt-textarea"

                  placeholder="Coupon description"
                />
              </div>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  sendingMail
                }

                onClick={() =>
                  setPendingOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  sendingMail
                }

                onClick={
                  handleSendPendingMail
                }

                className="tt-btn tt-btn-primary"
              >
                {sendingMail ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Send
                    className="h-4 w-4"
                  />
                )}

                Send Reminder
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          EXTEND ACCESS MODAL
      =================================================== */}

      {extendOrder ? (
        <Modal
          maxWidth="max-w-xl"
        >
          <ModalHeader
            icon={
              TimerReset
            }

            tone="emerald"

            title={
              extendOrder.access
                ?.revoked
                ? "Reactivate Book Access"
                : "Extend Book Access"
            }

            subtitle={
              extendOrder.customer
                ?.email ||

              extendOrder.orderId
            }

            onClose={() => {
              if (
                !extendingAccessOrderId
              ) {
                setExtendOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <AccessPanel
              order={
                extendOrder
              }

              nowMs={
                nowMs
              }
            />


            <div
              className="mt-5"
            >
              <p
                className="font-black"
              >
                Select Access Duration
              </p>


              <p
                className="tt-helper mt-1"
              >
                Expiry will be calculated from the current
                time, not from the previous expiry.
              </p>


              <div
                className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {EXTEND_PRESETS.map(
                  (
                    preset
                  ) => (
                    <button
                      key={
                        preset.hours
                      }

                      type="button"

                      onClick={() =>
                        setExtendHours(
                          String(
                            preset.hours
                          )
                        )
                      }

                      className={`tt-btn ${
                        Number(
                          extendHours
                        ) ===
                        preset.hours
                          ? "tt-btn-success"
                          : "tt-btn-secondary"
                      }`}
                    >
                      {preset.label}
                    </button>
                  )
                )}
              </div>


              <div
                className="mt-4"
              >
                <label
                  className="tt-label"
                >
                  Custom Hours
                </label>


                <input
                  type="number"

                  min="1"

                  step="1"

                  value={
                    extendHours
                  }

                  onChange={
                    (
                      event
                    ) =>
                      setExtendHours(
                        event.target.value
                      )
                  }

                  className="tt-input mt-2"
                />
              </div>


              {Number.isInteger(
                Number(
                  extendHours
                )
              ) &&
              Number(
                extendHours
              ) >
                0 ? (
                <div
                  className="mt-4 rounded-xl border p-3"

                  style={{
                    borderColor:
                      "var(--tt-success-border)",

                    background:
                      "var(--tt-success-soft)",
                  }}
                >
                  <p
                    className="tt-label"

                    style={{
                      color:
                        "var(--tt-success)",
                    }}
                  >
                    Expected New Expiry
                  </p>


                  <p
                    className="mt-1 text-sm font-black"

                    style={{
                      color:
                        "var(--tt-success)",
                    }}
                  >
                    {formatDate(
                      new Date(
                        nowMs +

                        Number(
                          extendHours
                        ) *
                          60 *
                          60 *
                          1000
                      )
                    )}
                  </p>
                </div>
              ) : null}
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  Boolean(
                    extendingAccessOrderId
                  )
                }

                onClick={() =>
                  setExtendOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  Boolean(
                    extendingAccessOrderId
                  )
                }

                onClick={
                  handleExtendAccess
                }

                className="tt-btn tt-btn-success"
              >
                {extendingAccessOrderId ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Zap
                    className="h-4 w-4"
                  />
                )}

                {extendOrder.access
                  ?.revoked
                  ? "Reactivate Access"
                  : "Extend Access"}
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          REVOKE ACCESS MODAL
      =================================================== */}

      {revokeOrder ? (
        <Modal>
          <ModalHeader
            icon={
              ShieldOff
            }

            tone="red"

            title="Revoke Book Access?"

            subtitle="The current customer access will stop immediately."

            onClose={() => {
              if (
                !revokingAccessOrderId
              ) {
                setRevokeOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <AccessPanel
              order={
                revokeOrder
              }

              nowMs={
                nowMs
              }
            />


            <div
              className="mt-4 rounded-xl border p-4"

              style={{
                borderColor:
                  "var(--tt-danger-border)",

                background:
                  "var(--tt-danger-soft)",
              }}
            >
              <div
                className="flex items-start gap-3"
              >
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0"

                  style={{
                    color:
                      "var(--tt-danger)",
                  }}
                />


                <div>
                  <p
                    className="font-black"

                    style={{
                      color:
                        "var(--tt-danger)",
                    }}
                  >
                    Customer access will stop immediately.
                  </p>


                  <p
                    className="tt-helper mt-1"
                  >
                    The existing token is preserved. You can
                    reactivate the same access later using
                    Extend Access.
                  </p>
                </div>
              </div>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  Boolean(
                    revokingAccessOrderId
                  )
                }

                onClick={() =>
                  setRevokeOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  Boolean(
                    revokingAccessOrderId
                  )
                }

                onClick={
                  handleRevokeAccess
                }

                className="tt-btn tt-btn-danger"
              >
                {revokingAccessOrderId ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <LockKeyhole
                    className="h-4 w-4"
                  />
                )}

                Revoke Access
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          REVIEW LINK MODAL
      =================================================== */}

      {reviewLinkModal ? (
        <Modal
          maxWidth="max-w-xl"
        >
          <ModalHeader
            icon={
              Link2
            }

            tone="violet"

            title="Review Link"

            subtitle={`${reviewLinkModal.customerName} • ${reviewLinkModal.bookTitle}`}

            onClose={() =>
              setReviewLinkModal(
                null
              )
            }
          />


          <div
            className="p-5 sm:p-6"
          >
            <div
              className="rounded-xl border p-4"

              style={{
                borderColor:
                  "var(--tt-border)",

                background:
                  "var(--tt-violet-soft)",
              }}
            >
              <p
                className="tt-label"

                style={{
                  color:
                    "var(--tt-violet)",
                }}
              >
                {reviewLinkModal.alreadyGenerated
                  ? "Existing Link"
                  : "New Link Generated"}
              </p>


              <p
                className="mt-2 break-all font-mono text-xs font-semibold leading-5"
              >
                {reviewLinkModal.reviewUrl}
              </p>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                onClick={() =>
                  copyValue(
                    reviewLinkModal.reviewUrl,
                    "Review link"
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                <Copy
                  className="h-4 w-4"
                />

                Copy Link
              </button>


              <button
                type="button"

                onClick={() =>
                  setReviewLinkModal(
                    null
                  )
                }

                className="tt-btn tt-btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      ) : null}


      {/* ===================================================
          DELETE MODAL
      =================================================== */}

      {deleteOrder ? (
        <Modal>
          <ModalHeader
            icon={
              Trash2
            }

            tone="red"

            title="Delete Payment?"

            subtitle="This permanently removes the payment and order record."

            onClose={() => {
              if (
                !deletingPayment
              ) {
                setDeleteOrder(
                  null
                );
              }
            }}
          />


          <div
            className="p-5 sm:p-6"
          >
            <div
              className="rounded-xl border p-4"

              style={{
                borderColor:
                  "var(--tt-danger-border)",

                background:
                  "var(--tt-danger-soft)",
              }}
            >
              <p
                className="text-sm font-semibold"
              >
                Customer:{" "}

                <strong>
                  {deleteOrder.customer
                    ?.email ||

                    deleteOrder.orderId}
                </strong>
              </p>


              <p
                className="mt-3 break-all font-mono text-[11px]"

                style={{
                  color:
                    "var(--tt-danger)",
                }}
              >
                {deleteOrder._id}
              </p>
            </div>


            <div
              className="mt-6 flex justify-end gap-2"
            >
              <button
                type="button"

                disabled={
                  deletingPayment
                }

                onClick={() =>
                  setDeleteOrder(
                    null
                  )
                }

                className="tt-btn tt-btn-secondary"
              >
                Cancel
              </button>


              <button
                type="button"

                disabled={
                  deletingPayment
                }

                onClick={
                  handleDeletePayment
                }

                className="tt-btn tt-btn-danger"
              >
                {deletingPayment ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                  />
                ) : (
                  <Trash2
                    className="h-4 w-4"
                  />
                )}

                Delete Payment
              </button>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}