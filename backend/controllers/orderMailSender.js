import mongoose from "mongoose";
import Order from "../models/Order.js";
import Book from "../models/Book.js";
import sendMail from "../utils/MailSender.js";
import { validateCouponForPayment } from "../controllers/couponController.js";

const TARGET_TREK_URL = "https://www.targettrek.in";
const ALL_BOOKS_URL = `${TARGET_TREK_URL}/books`;
const SUPPORT_EMAIL = "supporttargettrek@gmail.com";

const escapeHtml = (value = "") => {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const getCurrencySymbol = (currency = "INR") => {
  const normalized = String(currency).trim().toUpperCase();

  if (normalized === "INR") return "₹";
  if (normalized === "USD") return "$";
  if (normalized === "EUR") return "€";
  if (normalized === "GBP") return "£";

  return `${normalized} `;
};

const formatAmount = (amount, currency = "INR") => {
  const number = Number(amount || 0);
  return `${getCurrencySymbol(currency)}${number.toFixed(2)}`;
};

const getOrderQuery = (orderId) => {
  if (mongoose.Types.ObjectId.isValid(orderId)) {
    return {
      $or: [{ _id: orderId }, { orderId }],
    };
  }

  return { orderId };
};

const buildTargetTrekUrl = (redirectUrl = "") => {
  const cleanedPath = String(redirectUrl).trim().replace(/^\/+/, "");

  return cleanedPath
    ? `${TARGET_TREK_URL}/${cleanedPath}`
    : TARGET_TREK_URL;
};

const getBookCoverUrl = (coverImage) => {
  let url = "";

  if (typeof coverImage === "string") {
    url = coverImage.trim();
  } else if (coverImage && typeof coverImage === "object") {
    url = String(
      coverImage.secure_url ||
        coverImage.url ||
        ""
    ).trim();
  }

  return /^https?:\/\//i.test(url)
    ? url
    : "";
};

const renderDetailRow = (
  label,
  value,
  options = {}
) => {
  if (
    value === undefined ||
    value === null ||
    String(value).trim() === ""
  ) {
    return "";
  }

  const {
    strong = false,
    accent = false,
    strike = false,
  } = options;

  const safeLabel = escapeHtml(label);
  const safeValue = escapeHtml(value);

  return `
    <tr>
      <td
        style="
          padding: 10px 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          vertical-align: top;
        "
      >
        ${safeLabel}
      </td>

      <td
        align="right"
        style="
          padding: 10px 0;
          color: ${accent ? "#2563eb" : "#0f172a"};
          font-size: ${accent ? "17px" : "13px"};
          line-height: 1.5;
          font-weight: ${
            strong || accent
              ? "800"
              : "600"
          };
          text-decoration: ${
            strike
              ? "line-through"
              : "none"
          };
          vertical-align: top;
        "
      >
        ${safeValue}
      </td>
    </tr>
  `;
};

export const buildPendingPurchaseEmail =
  ({
    order,
    book,
    couponCode = "",
    couponDescription = "",
    couponValidation = null,
  }) => {
    const customerName =
      order.customer?.name?.trim() ||
      "there";

    const customerEmail =
      order.customer?.email?.trim() ||
      "";

    const bookTitle =
      book.title ||
      order.book?.title ||
      "your ebook";

    const currency =
      book.currency ||
      order.book?.currency ||
      "INR";

    const currentPrice =
      Number(book.price) ||
      0;

    const currentMrp =
      Number(book.mrp) ||
      0;

    const oldOrderPriceValue =
      Number(order.book?.price);

    const hasOldOrderPrice =
      Number.isFinite(
        oldOrderPriceValue
      ) &&
      oldOrderPriceValue > 0;

    const oldOrderPrice =
      hasOldOrderPrice
        ? oldOrderPriceValue
        : null;

    const purchaseUrl =
      buildTargetTrekUrl(
        book.redirectUrl
      );

    const coverImageUrl =
      getBookCoverUrl(
        book.coverImage
      );

    const orderStatus =
      String(
        order.orderStatus ||
          ""
      ).trim();

    const paymentStatus =
      String(
        order.payment?.status ||
          ""
      ).trim();

    const statusForDisplay =
      paymentStatus ||
      orderStatus ||
      "Pending";

    const priceChanged =
      hasOldOrderPrice &&
      Math.abs(
        oldOrderPrice -
          currentPrice
      ) > 0.001;

    const hasCoupon =
      Boolean(
        couponCode &&
          couponDescription
      );

    const couponDiscountAmount =
      couponValidation
        ?.discountAmount ??
      couponValidation?.data
        ?.discountAmount ??
      null;

    const couponFinalAmount =
      couponValidation
        ?.finalAmount ??
      couponValidation?.data
        ?.finalAmount ??
      null;

    const hasDiscountAmount =
      couponDiscountAmount !==
        null &&
      Number.isFinite(
        Number(
          couponDiscountAmount
        )
      );

    const hasFinalAmount =
      couponFinalAmount !== null &&
      Number.isFinite(
        Number(
          couponFinalAmount
        )
      );

    const safeCustomerName =
      escapeHtml(
        customerName
      );

    const safeCustomerEmail =
      escapeHtml(
        customerEmail
      );

    const safeBookTitle =
      escapeHtml(
        bookTitle
      );

    const safeBookSubtitle =
      escapeHtml(
        book.subtitle ||
          ""
      );

    const safeBookDescription =
      escapeHtml(
        book.shortDescription ||
          book.description ||
          ""
      );

    const safeCouponCode =
      escapeHtml(
        couponCode
      );

    const safeCouponDescription =
      escapeHtml(
        couponDescription
      );

    const safePurchaseUrl =
      escapeHtml(
        purchaseUrl
      );

    const safeCoverImageUrl =
      escapeHtml(
        coverImageUrl
      );

    const safeAllBooksUrl =
      escapeHtml(
        ALL_BOOKS_URL
      );

    const subject =
      hasCoupon
        ? `Complete your ${bookTitle} purchase — special coupon inside | Target Trek`
        : `Complete your ${bookTitle} purchase | Target Trek`;

    const metadataText = [
      book.edition
        ? `Edition: ${book.edition}`
        : "",

      book.level
        ? `Level: ${book.level}`
        : "",

      book.language
        ? `Language: ${book.language}`
        : "",

      book.format
        ? `Format: ${book.format}`
        : "",

      Array.isArray(
        book.categories
      ) &&
      book.categories.length
        ? `Categories: ${book.categories.join(
            ", "
          )}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    const couponText =
      hasCoupon
        ? `
SPECIAL OFFER

Coupon Code:
${couponCode}

Offer:
${couponDescription}

${
  hasDiscountAmount
    ? `Discount: ${formatAmount(
        couponDiscountAmount,
        currency
      )}`
    : ""
}

${
  hasFinalAmount
    ? `Price after coupon: ${formatAmount(
        couponFinalAmount,
        currency
      )}`
    : ""
}
`.trim()
        : "";

    const priceChangedText =
      priceChanged
        ? `
PRICE UPDATED

Previous Price:
${formatAmount(
  oldOrderPrice,
  currency
)}

Current Price:
${formatAmount(
  currentPrice,
  currency
)}
`.trim()
        : "";

    const text = `
Hi ${customerName},

You started purchasing "${bookTitle}" on Target Trek, but the payment was not completed.

PURCHASE DETAILS

Order ID:
${order.orderId || order._id || ""}

Customer Email:
${customerEmail}

Payment Status:
${statusForDisplay}

Book:
${bookTitle}

${
  book.subtitle
    ? `Subtitle: ${book.subtitle}`
    : ""
}

${metadataText}

${
  currentMrp >
  currentPrice
    ? `MRP: ${formatAmount(
        currentMrp,
        currency
      )}`
    : ""
}

Current Price:
${formatAmount(
  currentPrice,
  currency
)}

${couponText}

${priceChangedText}

Complete your purchase:
${purchaseUrl}

If the button in the HTML email does not open, copy and paste the link above into your browser.

Explore all available Target Trek books:
${ALL_BOOKS_URL}

Browse interview-focused resources across System Design, Backend Engineering, GenAI, and other developer topics to help you prepare for your next interview.

Price, availability, and offers can change. The final amount shown during checkout will apply.

If you have already completed this purchase, please ignore this email.

Need help?

Email:
${SUPPORT_EMAIL}

Website:
${TARGET_TREK_URL}

Regards,
Team Target Trek
    `.trim();

    const bookMetadataItems = [
      book.edition
        ? {
            label: "Edition",
            value:
              book.edition,
          }
        : null,

      book.level
        ? {
            label: "Level",
            value:
              book.level,
          }
        : null,

      book.language
        ? {
            label: "Language",
            value:
              book.language,
          }
        : null,

      book.format
        ? {
            label: "Format",
            value:
              book.format,
          }
        : null,

      Array.isArray(
        book.categories
      ) &&
      book.categories.length
        ? {
            label:
              "Categories",

            value:
              book.categories.join(
                ", "
              ),
          }
        : null,
    ].filter(Boolean);

    const bookMetadataHtml =
      bookMetadataItems.length
        ? `
      <table
        width="100%"
        cellspacing="0"
        cellpadding="0"
        border="0"
        style="
          margin-top: 14px;
        "
      >
        ${bookMetadataItems
          .map(
            (item) => `
          <tr>
            <td
              style="
                padding: 4px 0;
                color: #64748b;
                font-size: 12px;
                line-height: 1.5;
                width: 90px;
              "
            >
              ${escapeHtml(
                item.label
              )}
            </td>

            <td
              style="
                padding: 4px 0;
                color: #334155;
                font-size: 12px;
                line-height: 1.5;
                font-weight: 600;
              "
            >
              ${escapeHtml(
                item.value
              )}
            </td>
          </tr>
        `
          )
          .join("")}
      </table>
    `
        : "";

    const coverImageSection =
      coverImageUrl
        ? `
      <td
        width="150"
        valign="top"
        style="
          padding:
            18px
            20px
            18px
            18px;
        "
      >
        <img
          src="${safeCoverImageUrl}"
          alt="${safeBookTitle} cover"
          width="130"
          style="
            display: block;
            width: 130px;
            max-width: 130px;
            height: auto;
            border: 0;
            border-radius: 10px;
            box-shadow:
              0 4px 14px
              rgba(15, 23, 42, 0.12);
          "
        />
      </td>
    `
        : "";

    const couponSection =
      hasCoupon
        ? `
      <div
        style="
          margin-top: 22px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 14px;
          padding: 18px;
        "
      >
        <div
          style="
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #15803d;
          "
        >
          Special offer for you
        </div>

        <div
          style="
            margin-top: 9px;
            font-size: 14px;
            line-height: 1.7;
            color: #166534;
          "
        >
          ${safeCouponDescription}
        </div>

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            margin-top: 14px;
            background-color: #ffffff;
            border: 1px dashed #86efac;
            border-radius: 10px;
          "
        >
          <tr>
            <td
              style="
                padding:
                  15px
                  16px;
              "
            >
              <div
                style="
                  color: #64748b;
                  font-size: 10px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.08em;
                "
              >
                Coupon code
              </div>

              <div
                style="
                  margin-top: 5px;
                  color: #166534;
                  font-size: 22px;
                  font-weight: 800;
                  letter-spacing: 0.08em;
                "
              >
                ${safeCouponCode}
              </div>
            </td>
          </tr>
        </table>

        ${
          hasDiscountAmount
            ? `
          <div
            style="
              margin-top: 13px;
              color: #166534;
              font-size: 13px;
              line-height: 1.6;
            "
          >
            You save:
            <strong>
              ${formatAmount(
                couponDiscountAmount,
                currency
              )}
            </strong>
          </div>
        `
            : ""
        }

        ${
          hasFinalAmount
            ? `
          <div
            style="
              margin-top: 5px;
              color: #166534;
              font-size: 13px;
              line-height: 1.6;
            "
          >
            Price after coupon:
            <strong>
              ${formatAmount(
                couponFinalAmount,
                currency
              )}
            </strong>
          </div>
        `
            : ""
        }

        <div
          style="
            margin-top: 10px;
            color: #4d7c0f;
            font-size: 11px;
            line-height: 1.6;
          "
        >
          This coupon has been validated for this email address
          and book. The final amount displayed during checkout
          will apply.
        </div>
      </div>
    `
        : "";

    const priceChangedSection =
      priceChanged
        ? `
      <div
        style="
          margin-top: 18px;
          padding: 15px 16px;
          background-color: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 12px;
        "
      >
        <div
          style="
            color: #9a3412;
            font-size: 13px;
            line-height: 1.65;
          "
        >
          <strong>
            Price updated
          </strong>

          <br />

          The current book price is different from the price
          recorded on your earlier purchase attempt.

          <br />
          <br />

          Previous price:

          <strong>
            ${formatAmount(
              oldOrderPrice,
              currency
            )}
          </strong>

          <br />

          Current price:

          <strong>
            ${formatAmount(
              currentPrice,
              currency
            )}
          </strong>
        </div>
      </div>
    `
        : "";

    const html = `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta
    charset="UTF-8"
  />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <meta
    name="color-scheme"
    content="light"
  />

  <meta
    name="supported-color-schemes"
    content="light"
  />

  <title>
    Complete Your Purchase
  </title>

</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f7fb;
    font-family:
      Arial,
      Helvetica,
      sans-serif;
    color: #0f172a;
  "
>

  <table
    width="100%"
    cellspacing="0"
    cellpadding="0"
    border="0"
    style="
      width: 100%;
      background-color: #f4f7fb;
    "
  >

    <tr>

      <td
        align="center"
        style="
          padding:
            32px
            14px;
        "
      >

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width: 100%;
            max-width: 680px;
            background-color: #ffffff;
            border:
              1px solid #e2e8f0;
            border-radius: 18px;
            overflow: hidden;
            box-shadow:
              0 8px 28px
              rgba(15, 23, 42, 0.06);
          "
        >

          <tr>

            <td
              style="
                padding:
                  24px
                  30px;
                background-color: #eff6ff;
                border-bottom:
                  1px solid #dbeafe;
              "
            >

              <div
                style="
                  color: #2563eb;
                  font-size: 24px;
                  font-weight: 800;
                  letter-spacing: -0.4px;
                "
              >
                Target Trek
              </div>

              <div
                style="
                  margin-top: 5px;
                  color: #64748b;
                  font-size: 12px;
                "
              >
                Learn. Build. Grow.
              </div>

            </td>

          </tr>

          <tr>

            <td
              style="
                padding:
                  32px
                  30px
                  30px;
              "
            >

              <div
                style="
                  display: inline-block;
                  padding:
                    7px
                    12px;
                  background-color: #fff7ed;
                  color: #c2410c;
                  border-radius: 999px;
                  font-size: 11px;
                  font-weight: 800;
                  letter-spacing: 0.07em;
                  text-transform: uppercase;
                "
              >
                Purchase not completed
              </div>

              <h1
                style="
                  margin:
                    18px
                    0
                    10px;
                  color: #0f172a;
                  font-size: 27px;
                  line-height: 1.35;
                "
              >
                Hi ${safeCustomerName},
              </h1>

              <p
                style="
                  margin: 0;
                  color: #475569;
                  font-size: 15px;
                  line-height: 1.75;
                "
              >
                You started purchasing

                <strong
                  style="
                    color: #0f172a;
                  "
                >
                  ${safeBookTitle}
                </strong>

                on Target Trek, but the payment was not completed.
                Your book page is still available, so you can
                continue whenever you're ready.
              </p>

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top: 24px;
                  background-color: #f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 14px;
                "
              >

                <tr>

                  ${coverImageSection}

                  <td
                    valign="top"
                    style="
                      padding: ${
                        coverImageUrl
                          ? "18px 18px 18px 0"
                          : "20px"
                      };
                    "
                  >

                    <div
                      style="
                        color: #2563eb;
                        font-size: 11px;
                        font-weight: 800;
                        letter-spacing: 0.08em;
                        text-transform: uppercase;
                      "
                    >
                      Your selected book
                    </div>

                    <div
                      style="
                        margin-top: 7px;
                        color: #0f172a;
                        font-size: 19px;
                        font-weight: 800;
                        line-height: 1.4;
                      "
                    >
                      ${safeBookTitle}
                    </div>

                    ${
                      safeBookSubtitle
                        ? `
                      <div
                        style="
                          margin-top: 5px;
                          color: #475569;
                          font-size: 13px;
                          line-height: 1.6;
                        "
                      >
                        ${safeBookSubtitle}
                      </div>
                    `
                        : ""
                    }

                    ${
                      safeBookDescription
                        ? `
                      <div
                        style="
                          margin-top: 10px;
                          color: #64748b;
                          font-size: 12px;
                          line-height: 1.65;
                        "
                      >
                        ${safeBookDescription}
                      </div>
                    `
                        : ""
                    }

                    ${bookMetadataHtml}

                  </td>

                </tr>

              </table>

              <div
                style="
                  margin-top: 22px;
                  padding:
                    18px
                    20px;
                  background-color: #ffffff;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 14px;
                "
              >

                <div
                  style="
                    color: #0f172a;
                    font-size: 14px;
                    font-weight: 800;
                    margin-bottom: 7px;
                  "
                >
                  Purchase details
                </div>

                <table
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                >

                  ${renderDetailRow(
                    "Order ID",
                    order.orderId ||
                      order._id ||
                      "",
                    {
                      strong: true,
                    }
                  )}

                  ${renderDetailRow(
                    "Customer Email",
                    customerEmail
                  )}

                  ${renderDetailRow(
                    "Payment Status",
                    statusForDisplay,
                    {
                      strong: true,
                    }
                  )}

                  ${
                    currentMrp >
                    currentPrice
                      ? renderDetailRow(
                          "MRP",
                          formatAmount(
                            currentMrp,
                            currency
                          ),
                          {
                            strike:
                              true,
                          }
                        )
                      : ""
                  }

                  ${renderDetailRow(
                    "Current Price",
                    formatAmount(
                      currentPrice,
                      currency
                    ),
                    {
                      accent: true,
                    }
                  )}

                  ${
                    currentMrp >
                    currentPrice
                      ? renderDetailRow(
                          "Current Saving",
                          formatAmount(
                            currentMrp -
                              currentPrice,
                            currency
                          ),
                          {
                            strong:
                              true,
                          }
                        )
                      : ""
                  }

                </table>

              </div>

              <div
                style="
                  margin:
                    8px
                    2px
                    0;
                  color: #94a3b8;
                  font-size: 11px;
                  line-height: 1.55;
                  text-align: right;
                "
              >
                Price, availability, and offers can change.
                The final amount displayed during checkout
                will apply.
              </div>

              ${priceChangedSection}

              ${couponSection}

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top: 28px;
                "
              >

                <tr>

                  <td
                    align="center"
                  >

                    <a
                      href="${safePurchaseUrl}"
                      target="_blank"
                      rel="noopener noreferrer"
                      style="
                        display: inline-block;
                        padding:
                          15px
                          32px;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        border-radius: 10px;
                        font-size: 15px;
                        font-weight: 800;
                      "
                    >
                      Complete Your Purchase
                    </a>

                  </td>

                </tr>

              </table>

              <div
                style="
                  margin-top: 20px;
                  padding:
                    15px
                    16px;
                  background-color: #f8fafc;
                  border:
                    1px solid #e2e8f0;
                  border-radius: 12px;
                "
              >

                <div
                  style="
                    color: #475569;
                    font-size: 12px;
                    font-weight: 800;
                  "
                >
                  Button not opening?
                </div>

                <div
                  style="
                    margin-top: 6px;
                    color: #64748b;
                    font-size: 12px;
                    line-height: 1.65;
                  "
                >
                  Copy and paste this secure Target Trek link
                  into your browser:
                </div>

                <div
                  style="
                    margin-top: 8px;
                    word-break: break-all;
                  "
                >

                  <a
                    href="${safePurchaseUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      color: #2563eb;
                      font-size: 12px;
                      text-decoration: underline;
                    "
                  >
                    ${safePurchaseUrl}
                  </a>

                </div>

              </div>

              <div
                style="
                  margin-top: 24px;
                  padding: 20px;
                  background-color: #eff6ff;
                  border:
                    1px solid #dbeafe;
                  border-radius: 14px;
                "
              >

                <div
                  style="
                    color: #1d4ed8;
                    font-size: 16px;
                    font-weight: 800;
                    line-height: 1.4;
                  "
                >
                  Preparing for your next developer interview?
                </div>

                <div
                  style="
                    margin-top: 8px;
                    color: #475569;
                    font-size: 13px;
                    line-height: 1.75;
                  "
                >
                  Explore all available books on Target Trek
                  for interview-focused learning across
                  System Design, Backend Engineering, GenAI,
                  and other developer topics.

                  Pick the resources that match the skills
                  you want to strengthen for your next
                  interview.
                </div>

                <div
                  style="
                    margin-top: 16px;
                  "
                >

                  <a
                    href="${safeAllBooksUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      display: inline-block;
                      padding:
                        11px
                        18px;
                      background-color: #ffffff;
                      border:
                        1px solid #93c5fd;
                      color: #1d4ed8;
                      text-decoration: none;
                      border-radius: 9px;
                      font-size: 13px;
                      font-weight: 800;
                    "
                  >
                    Explore All Books
                  </a>

                </div>

                <div
                  style="
                    margin-top: 10px;
                    word-break: break-all;
                  "
                >

                  <a
                    href="${safeAllBooksUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      color: #2563eb;
                      font-size: 11px;
                      text-decoration: underline;
                    "
                  >
                    ${safeAllBooksUrl}
                  </a>

                </div>

              </div>

              <div
                style="
                  margin-top: 22px;
                  padding:
                    15px
                    16px;
                  background-color: #f0f9ff;
                  border:
                    1px solid #bae6fd;
                  border-radius: 12px;
                  color: #475569;
                  font-size: 13px;
                  line-height: 1.7;
                "
              >

                <strong
                  style="
                    color: #0369a1;
                  "
                >
                  Already completed your payment?
                </strong>

                <br />

                If you've already completed this purchase,
                you can safely ignore this email.

              </div>

              <p
                style="
                  margin:
                    24px
                    0
                    0;
                  color: #64748b;
                  font-size: 13px;
                  line-height: 1.7;
                "
              >

                Need help with your purchase?

                <br />

                Contact us at

                <a
                  href="mailto:${SUPPORT_EMAIL}"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                    font-weight: 700;
                  "
                >
                  ${SUPPORT_EMAIL}
                </a>.

              </p>

              <p
                style="
                  margin:
                    18px
                    0
                    0;
                  color: #475569;
                  font-size: 14px;
                  line-height: 1.7;
                "
              >

                Regards,

                <br />

                <strong
                  style="
                    color: #0f172a;
                  "
                >
                  Team Target Trek
                </strong>

              </p>

            </td>

          </tr>

          <tr>

            <td
              align="center"
              style="
                padding:
                  24px
                  26px;
                background-color: #f8fafc;
                border-top:
                  1px solid #e2e8f0;
              "
            >

              <div
                style="
                  color: #2563eb;
                  font-size: 15px;
                  font-weight: 800;
                "
              >
                Target Trek
              </div>

              <div
                style="
                  margin-top: 8px;
                  color: #94a3b8;
                  font-size: 11px;
                  line-height: 1.65;
                "
              >
                This email was sent because a purchase
                was initiated using ${safeCustomerEmail}.
              </div>

              <div
                style="
                  margin-top: 11px;
                  font-size: 11px;
                "
              >

                <a
                  href="${TARGET_TREK_URL}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                  "
                >
                  www.targettrek.in
                </a>

                <span
                  style="
                    margin:
                      0
                      7px;
                    color: #cbd5e1;
                  "
                >
                  •
                </span>

                <a
                  href="${ALL_BOOKS_URL}"
                  target="_blank"
                  rel="noopener noreferrer"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                  "
                >
                  All Books
                </a>

                <span
                  style="
                    margin:
                      0
                      7px;
                    color: #cbd5e1;
                  "
                >
                  •
                </span>

                <a
                  href="mailto:${SUPPORT_EMAIL}"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                  "
                >
                  Support
                </a>

              </div>

              <div
                style="
                  margin-top: 10px;
                  color: #94a3b8;
                  font-size: 11px;
                "
              >
                © ${new Date().getFullYear()}
                Target Trek.
                All rights reserved.
              </div>

            </td>

          </tr>

        </table>

      </td>

    </tr>

  </table>

</body>

</html>
    `.trim();

    return {
      subject,
      text,
      html,
      purchaseUrl,
    };
  };

const sendPendingPurchaseMail =
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      const rawCouponCode =
        typeof req.body
          ?.couponCode ===
        "string"
          ? req.body.couponCode.trim()
          : "";

      const rawCouponDescription =
        typeof req.body
          ?.couponDescription ===
        "string"
          ? req.body.couponDescription.trim()
          : "";

      if (!orderId) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Order ID is required.",
          });
      }

      const hasCouponCode =
        Boolean(
          rawCouponCode
        );

      const hasCouponDescription =
        Boolean(
          rawCouponDescription
        );

      if (
        hasCouponCode !==
        hasCouponDescription
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Coupon code and coupon description must both be provided, or both must be empty.",
          });
      }

      const order =
        await Order.findOne(
          getOrderQuery(
            orderId
          )
        );

      if (!order) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Order not found.",
          });
      }

      const allowedStatuses =
        new Set([
          "pending",
          "failed",
          "bounced",
        ]);

      const orderStatus =
        String(
          order.orderStatus ||
            ""
        )
          .trim()
          .toLowerCase();

      const paymentStatus =
        String(
          order.payment
            ?.status ||
            ""
        )
          .trim()
          .toLowerCase();

      if (
        !allowedStatuses.has(
          orderStatus
        ) ||
        !allowedStatuses.has(
          paymentStatus
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Reminder email can only be sent for pending, failed, or bounced orders.",
          });
      }

      const customerEmail =
        order.customer?.email
          ?.trim()
          .toLowerCase();

      if (!customerEmail) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Customer email is not available.",
          });
      }

      const book =
        await Book.findById(
          order.bookId
        ).select(`
          title
          subtitle
          description
          shortDescription
          edition
          categories
          level
          language
          format
          price
          mrp
          currency
          paymentUrl
          redirectUrl
          coverImage
          isActive
          isPublished
        `);

      if (!book) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Book associated with this order no longer exists.",
          });
      }

      if (
        !book.isActive
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "This book is currently inactive. Reminder email was not sent.",
          });
      }

      if (
        !book.isPublished
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "This book is currently unpublished. Reminder email was not sent.",
          });
      }

      if (
        !book.redirectUrl
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Book purchase page is not configured.",
          });
      }

      let couponValidation =
        null;

      if (
        hasCouponCode &&
        hasCouponDescription
      ) {
        try {
          couponValidation =
            await validateCouponForPayment(
              {
                couponCode:
                  rawCouponCode,

                bookId:
                  String(
                    book._id
                  ),

                book,

                email:
                  customerEmail,
              }
            );

          if (
            couponValidation
              ?.valid ===
              false ||
            couponValidation
              ?.success ===
              false
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  couponValidation
                    ?.message ||
                  "Coupon is not valid for this customer and book.",
              });
          }
        } catch (
          couponError
        ) {
          console.error(
            "Coupon validation error:",
            couponError
          );

          return res
            .status(
              couponError
                ?.statusCode ||
                400
            )
            .json({
              success:
                false,

              code:
                couponError
                  ?.code ||
                "COUPON_VALIDATION_FAILED",

              message:
                couponError
                  ?.message ||
                "Coupon is not valid for this customer and book.",
            });
        }
      }

      const finalCouponCode =
        hasCouponCode
          ? rawCouponCode
              .trim()
              .toUpperCase()
          : "";

      const finalCouponDescription =
        hasCouponDescription
          ? rawCouponDescription
          : "";

      const {
        subject,
        text,
        html,
        purchaseUrl,
      } =
        buildPendingPurchaseEmail(
          {
            order,
            book,

            couponCode:
              finalCouponCode,

            couponDescription:
              finalCouponDescription,

            couponValidation,
          }
        );

      try {
        await sendMail(
          customerEmail,
          subject,
          text,
          html
        );
      } catch (
        mailError
      ) {
        console.error(
          "Pending mail send error:",
          mailError
        );

        await Order.updateOne(
          {
            _id:
              order._id,
          },
          {
            $set: {
              "pendingMail.lastStatus":
                "FAILED",

              "pendingMail.lastError":
                mailError
                  ?.message ||
                "Failed to send email",
            },
          }
        );

        return res
          .status(500)
          .json({
            success: false,

            message:
              "Failed to send pending purchase email.",
          });
      }

      const now =
        new Date();

      const adminIdentifier =
        req.user?.email ||
        req.admin?.email ||
        req.user?._id ||
        req.admin?._id ||
        "ADMIN";

      const pendingMailUpdate =
        {
          $inc: {
            "pendingMail.sentCount":
              1,
          },

          $set: {
            "pendingMail.lastSentAt":
              now,

            "pendingMail.lastSentBy":
              String(
                adminIdentifier
              ),

            "pendingMail.lastStatus":
              "SENT",

            "pendingMail.lastError":
              null,

            updatedBy:
              String(
                adminIdentifier
              ),
          },
        };

      if (
        !order.pendingMail
          ?.firstSentAt
      ) {
        pendingMailUpdate.$set[
          "pendingMail.firstSentAt"
        ] = now;
      }

      const updatedOrder =
        await Order.findByIdAndUpdate(
          order._id,
          pendingMailUpdate,
          {
            new: true,
          }
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Pending purchase email sent successfully.",

          data: {
            orderId:
              updatedOrder.orderId,

            mongoOrderId:
              updatedOrder._id,

            orderStatus:
              updatedOrder.orderStatus,

            paymentStatus:
              updatedOrder.payment
                ?.status,

            customer: {
              name:
                updatedOrder.customer
                  ?.name,

              email:
                updatedOrder.customer
                  ?.email,
            },

            book: {
              id:
                book._id,

              title:
                book.title,

              subtitle:
                book.subtitle ||
                null,

              edition:
                book.edition ||
                null,

              categories:
                book.categories ||
                [],

              level:
                book.level ||
                null,

              language:
                book.language ||
                null,

              format:
                book.format ||
                null,

              currentPrice:
                book.price,

              mrp:
                book.mrp,

              currency:
                book.currency,

              coverImage:
                getBookCoverUrl(
                  book.coverImage
                ) ||
                null,

              redirectUrl:
                book.redirectUrl,

              purchaseUrl,
            },

            coupon: {
              included:
                Boolean(
                  finalCouponCode
                ),

              code:
                finalCouponCode ||
                null,

              description:
                finalCouponDescription ||
                null,

              validation:
                couponValidation
                  ? {
                      valid:
                        true,

                      discountAmount:
                        couponValidation
                          ?.discountAmount ??
                        couponValidation
                          ?.data
                          ?.discountAmount ??
                        null,

                      finalAmount:
                        couponValidation
                          ?.finalAmount ??
                        couponValidation
                          ?.data
                          ?.finalAmount ??
                        null,
                    }
                  : null,
            },

            email: {
              subject,

              purchaseUrl,

              allBooksUrl:
                ALL_BOOKS_URL,

              coverImage:
                getBookCoverUrl(
                  book.coverImage
                ) ||
                null,
            },

            pendingMail: {
              sentCount:
                updatedOrder
                  .pendingMail
                  ?.sentCount ||
                0,

              firstSentAt:
                updatedOrder
                  .pendingMail
                  ?.firstSentAt,

              lastSentAt:
                updatedOrder
                  .pendingMail
                  ?.lastSentAt,

              lastSentBy:
                updatedOrder
                  .pendingMail
                  ?.lastSentBy,

              lastStatus:
                updatedOrder
                  .pendingMail
                  ?.lastStatus,

              lastError:
                updatedOrder
                  .pendingMail
                  ?.lastError,
            },
          },
        });
    } catch (
      error
    ) {
      console.error(
        "sendPendingPurchaseMail error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Something went wrong while sending the pending purchase email.",
        });
    }
  };

export default sendPendingPurchaseMail;