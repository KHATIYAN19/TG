import Order from "../models/Order.js";
import Book from "../models/Book.js";
import sendMail from "../utils/MailSender.js";

const sendPendingPurchaseMail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // =====================================================
    // FIND ORDER
    // =====================================================

    const order = await Order.findOne({
      orderId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // =====================================================
    // CHECK ORDER STATUS
    // =====================================================

    if (
      order.orderStatus !== "PENDING" ||
      order.payment?.status !== "PENDING"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reminder email can only be sent for pending orders",
      });
    }

    // =====================================================
    // CHECK CUSTOMER EMAIL
    // =====================================================

    if (!order.customer?.email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is not available",
      });
    }

    // =====================================================
    // GET LATEST BOOK DETAILS
    // =====================================================

    const book = await Book.findById(order.bookId).select(
      "title price mrp currency paymentUrl redirectUrl isActive isPublished"
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message:
          "Book associated with this order no longer exists",
      });
    }

    // =====================================================
    // CHECK BOOK ACTIVE
    // =====================================================

    if (!book.isActive) {
      return res.status(400).json({
        success: false,
        message:
          "This book is currently inactive. Reminder email was not sent.",
      });
    }

    // =====================================================
    // CHECK BOOK PUBLISHED
    // =====================================================

    if (!book.isPublished) {
      return res.status(400).json({
        success: false,
        message:
          "This book is currently unpublished. Reminder email was not sent.",
      });
    }

    // =====================================================
    // CURRENT BOOK DETAILS
    // =====================================================

    const customerName =
      order.customer?.name?.trim() || "there";

    const customerEmail =
      order.customer.email;

    const bookTitle =
      book.title || order.book?.title || "your ebook";

    const currentPrice =
      Number(book.price) || 0;

    const currentMrp =
      Number(book.mrp) || 0;

    const currency =
      book.currency || "INR";

    // =====================================================
    // CURRENCY SYMBOL
    // =====================================================

    const currencySymbol =
      currency === "INR"
        ? "₹"
        : currency === "USD"
        ? "$"
        : currency === "EUR"
        ? "€"
        : currency === "GBP"
        ? "£"
        : `${currency} `;

    // =====================================================
    // PURCHASE URL
    // =====================================================

    const purchaseUrl =
      book.redirectUrl;

    if (!purchaseUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Book purchase page is not configured",
      });
    }

    // =====================================================
    // PRICE DIFFERENCE
    // =====================================================

    const oldOrderPrice =
      Number(order.book?.price) || 0;

    const priceChanged =
      oldOrderPrice !== currentPrice;

    // =====================================================
    // COUPON FROM OLD ORDER
    // ONLY DISPLAY INFORMATION
    // DO NOT AUTOMATICALLY APPLY IT
    // =====================================================

    const oldCouponCode =
      order.coupon?.applied &&
      order.coupon?.code
        ? order.coupon.code
        : null;

    // =====================================================
    // SUBJECT
    // =====================================================

    const subject =
      `Complete your ${bookTitle} purchase | Target Trek`;

    // =====================================================
    // TEXT EMAIL
    // =====================================================

    const text = `
Hi ${customerName},

We noticed that you started purchasing "${bookTitle}" on Target Trek, but your payment was not completed.

Order ID: ${order.orderId}

Current Price:
${currencySymbol}${currentPrice.toFixed(2)}

${
  currentMrp > currentPrice
    ? `MRP: ${currencySymbol}${currentMrp.toFixed(2)}`
    : ""
}

${
  oldCouponCode
    ? `Coupon previously used: ${oldCouponCode}`
    : ""
}

${
  priceChanged
    ? `Please note: The price has changed since your previous order attempt.`
    : ""
}

Prices and offers may change at any time. The price displayed on Target Trek at the time of purchase will be considered final.

Continue your purchase here:

${purchaseUrl}

If you already completed the payment, please ignore this email.

Regards,
Team Target Trek
https://www.targettrek.in
    `.trim();

    // =====================================================
    // MRP HTML
    // =====================================================

    const mrpSection =
      currentMrp > currentPrice
        ? `
          <tr>
            <td
              style="
                padding: 11px 0;
                color: #64748b;
                font-size: 14px;
              "
            >
              MRP
            </td>

            <td
              align="right"
              style="
                padding: 11px 0;
                color: #94a3b8;
                font-size: 14px;
                text-decoration: line-through;
              "
            >
              ${currencySymbol}${currentMrp.toFixed(2)}
            </td>
          </tr>
        `
        : "";

    // =====================================================
    // OLD COUPON INFORMATION
    // =====================================================

    const couponSection =
      oldCouponCode
        ? `
          <div
            style="
              margin-top: 18px;
              padding: 14px 16px;
              background-color: #f0fdf4;
              border: 1px solid #bbf7d0;
              border-radius: 10px;
            "
          >
            <div
              style="
                font-size: 13px;
                color: #166534;
                line-height: 1.6;
              "
            >
              <strong>
                Coupon used previously:
              </strong>

              ${oldCouponCode}

              <br />

              Coupon availability and discount may have
              changed. Any valid offer shown on the Target
              Trek purchase page will apply at checkout.
            </div>
          </div>
        `
        : "";

    // =====================================================
    // PRICE CHANGED INFORMATION
    // =====================================================

    const priceChangedSection =
      priceChanged
        ? `
          <div
            style="
              margin-top: 18px;
              padding: 14px 16px;
              background-color: #fff7ed;
              border: 1px solid #fed7aa;
              border-radius: 10px;
            "
          >
            <div
              style="
                font-size: 13px;
                line-height: 1.6;
                color: #9a3412;
              "
            >
              <strong>
                Price updated
              </strong>

              <br />

              The price of this book has changed since
              your previous purchase attempt.

              The current price is
              <strong>
                ${currencySymbol}${currentPrice.toFixed(2)}
              </strong>.
            </div>
          </div>
        `
        : "";

    // =====================================================
    // HTML EMAIL
    // =====================================================

    const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>Complete Your Purchase</title>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f4f8ff;
    font-family: Arial, Helvetica, sans-serif;
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
      background-color: #f4f8ff;
      padding: 35px 15px;
    "
  >

    <tr>

      <td align="center">

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            max-width: 620px;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #dbeafe;
            box-shadow:
              0 8px 30px rgba(37, 99, 235, 0.08);
          "
        >

          <!-- HEADER -->

          <tr>

            <td
              style="
                padding: 26px 32px;
                background-color: #eff6ff;
                border-bottom: 1px solid #dbeafe;
              "
            >

              <div
                style="
                  font-size: 26px;
                  font-weight: 700;
                  color: #2563eb;
                  letter-spacing: -0.5px;
                "
              >
                Target Trek
              </div>

              <div
                style="
                  margin-top: 5px;
                  color: #64748b;
                  font-size: 13px;
                "
              >
                Learn. Build. Grow.
              </div>

            </td>

          </tr>

          <!-- MAIN CONTENT -->

          <tr>

            <td
              style="
                padding: 36px 32px 24px 32px;
              "
            >

              <div
                style="
                  display: inline-block;
                  background-color: #fff7ed;
                  color: #c2410c;
                  padding: 7px 12px;
                  border-radius: 20px;
                  font-size: 12px;
                  font-weight: 600;
                  margin-bottom: 20px;
                "
              >
                PAYMENT PENDING
              </div>

              <h1
                style="
                  margin: 0 0 18px 0;
                  font-size: 26px;
                  line-height: 1.35;
                  color: #0f172a;
                "
              >
                Hi ${customerName} 👋
              </h1>

              <p
                style="
                  margin: 0 0 16px 0;
                  color: #475569;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >

                We noticed that you started purchasing

                <strong
                  style="
                    color: #0f172a;
                  "
                >
                  ${bookTitle}
                </strong>

                on Target Trek, but your payment was not
                completed.

              </p>

              <p
                style="
                  margin: 0 0 26px 0;
                  color: #475569;
                  font-size: 16px;
                  line-height: 1.7;
                "
              >

                The book is currently available and you
                can continue your purchase below.

              </p>

              <!-- ORDER CARD -->

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 8px 20px;
                "
              >

                <tr>

                  <td
                    style="
                      padding: 18px 0 12px 0;
                      color: #0f172a;
                      font-size: 15px;
                      font-weight: 700;
                    "
                  >
                    Purchase Details
                  </td>

                  <td></td>

                </tr>

                <tr>

                  <td
                    style="
                      padding: 11px 0;
                      color: #64748b;
                      font-size: 14px;
                      border-top: 1px solid #e2e8f0;
                    "
                  >
                    Order ID
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 11px 0;
                      color: #334155;
                      font-size: 14px;
                      font-weight: 600;
                      border-top: 1px solid #e2e8f0;
                    "
                  >
                    ${order.orderId}
                  </td>

                </tr>

                <tr>

                  <td
                    style="
                      padding: 11px 0;
                      color: #64748b;
                      font-size: 14px;
                    "
                  >
                    Ebook
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 11px 0;
                      color: #334155;
                      font-size: 14px;
                      font-weight: 600;
                    "
                  >
                    ${bookTitle}
                  </td>

                </tr>

                ${mrpSection}

                <tr>

                  <td
                    style="
                      padding: 15px 0 18px 0;
                      color: #0f172a;
                      font-size: 15px;
                      font-weight: 700;
                      border-top: 1px solid #e2e8f0;
                    "
                  >
                    Current Price
                  </td>

                  <td
                    align="right"
                    style="
                      padding: 15px 0 18px 0;
                      color: #2563eb;
                      font-size: 20px;
                      font-weight: 700;
                      border-top: 1px solid #e2e8f0;
                    "
                  >
                    ${currencySymbol}${currentPrice.toFixed(2)}
                  </td>

                </tr>

              </table>

              <!-- PRICE DISCLAIMER -->

              <p
                style="
                  margin: 8px 4px 0 4px;
                  color: #94a3b8;
                  font-size: 11px;
                  line-height: 1.5;
                  text-align: right;
                "
              >
                *Price and offers may change.
                The price displayed on Target Trek at the
                time of purchase will be considered final.
              </p>

              ${priceChangedSection}

              ${couponSection}

              <!-- BUY BUTTON -->

              <table
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  margin-top: 30px;
                "
              >

                <tr>

                  <td align="center">

                    <a
                      href="${purchaseUrl}"
                      target="_blank"
                      style="
                        display: inline-block;
                        padding: 15px 34px;
                        background-color: #2563eb;
                        color: #ffffff;
                        text-decoration: none;
                        font-size: 16px;
                        font-weight: 700;
                        border-radius: 9px;
                      "
                    >
                      Complete Your Purchase
                    </a>

                  </td>

                </tr>

              </table>

              <p
                style="
                  text-align: center;
                  margin: 15px 0 0 0;
                  color: #94a3b8;
                  font-size: 12px;
                  line-height: 1.6;
                "
              >
                You will be redirected to the official
                Target Trek purchase page.
              </p>

            </td>

          </tr>

          <!-- INFO -->

          <tr>

            <td
              style="
                padding: 8px 32px 30px 32px;
              "
            >

              <div
                style="
                  padding: 16px;
                  background-color: #f0f9ff;
                  border: 1px solid #bae6fd;
                  border-radius: 10px;
                  font-size: 13px;
                  line-height: 1.7;
                  color: #475569;
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

                If you've already completed your payment,
                please ignore this email.

              </div>

            </td>

          </tr>

          <!-- SUPPORT -->

          <tr>

            <td
              style="
                padding: 0 32px 30px 32px;
              "
            >

              <p
                style="
                  margin: 0;
                  color: #64748b;
                  font-size: 14px;
                  line-height: 1.7;
                "
              >
                Need help with your purchase?
                Reply to this email and our team will
                assist you.
              </p>

              <p
                style="
                  margin: 18px 0 0 0;
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

          <!-- FOOTER -->

          <tr>

            <td
              align="center"
              style="
                padding: 24px 30px;
                background-color: #f8fafc;
                border-top: 1px solid #e2e8f0;
              "
            >

              <div
                style="
                  color: #2563eb;
                  font-size: 16px;
                  font-weight: 700;
                  margin-bottom: 8px;
                "
              >
                Target Trek
              </div>

              <p
                style="
                  margin: 0;
                  color: #94a3b8;
                  font-size: 12px;
                  line-height: 1.7;
                "
              >
                This email was sent because a purchase
                was initiated using this email address.
              </p>

              <p
                style="
                  margin: 8px 0 0 0;
                  color: #94a3b8;
                  font-size: 12px;
                "
              >
                © ${new Date().getFullYear()}
                Target Trek. All rights reserved.
              </p>

              <p
                style="
                  margin: 8px 0 0 0;
                  font-size: 12px;
                "
              >

                <a
                  href="https://www.targettrek.in"
                  style="
                    color: #2563eb;
                    text-decoration: none;
                  "
                >
                  www.targettrek.in
                </a>

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

    // =====================================================
    // SEND EMAIL
    // =====================================================

    try {
      await sendMail(
        customerEmail,
        subject,
        text,
        html
      );
    } catch (mailError) {
      await Order.findOneAndUpdate(
        {
          orderId,
        },
        {
          $set: {
            "pendingMail.lastStatus":
              "FAILED",

            "pendingMail.lastError":
              mailError?.message ||
              "Failed to send email",
          },
        }
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to send pending purchase email",
      });
    }

    // =====================================================
    // UPDATE MAIL TRACKING
    // =====================================================

    const now = new Date();

    const adminIdentifier =
      req.user?.email ||
      req.admin?.email ||
      "ADMIN";

    const pendingMailUpdate = {
      $inc: {
        "pendingMail.sentCount": 1,
      },

      $set: {
        "pendingMail.lastSentAt":
          now,

        "pendingMail.lastSentBy":
          adminIdentifier,

        "pendingMail.lastStatus":
          "SENT",

        "pendingMail.lastError":
          null,

        updatedBy:
          adminIdentifier,
      },
    };

    if (!order.pendingMail?.firstSentAt) {
      pendingMailUpdate.$set[
        "pendingMail.firstSentAt"
      ] = now;
    }

    const updatedOrder =
      await Order.findOneAndUpdate(
        {
          orderId,
        },
        pendingMailUpdate,
        {
          new: true,
        }
      );

    // =====================================================
    // RESPONSE
    // =====================================================

    return res.status(200).json({
      success: true,

      message:
        "Pending purchase email sent successfully",

      data: {
        orderId:
          updatedOrder.orderId,

        customer: {
          name:
            updatedOrder.customer?.name,

          email:
            updatedOrder.customer?.email,
        },

        book: {
          id: book._id,
          title: book.title,
          currentPrice: book.price,
          mrp: book.mrp,
          currency: book.currency,
          redirectUrl: book.redirectUrl,
        },

        priceChanged,

        previousOrderPrice:
          oldOrderPrice,

        currentPrice,

        pendingMail: {
          sentCount:
            updatedOrder.pendingMail
              ?.sentCount || 0,

          firstSentAt:
            updatedOrder.pendingMail
              ?.firstSentAt,

          lastSentAt:
            updatedOrder.pendingMail
              ?.lastSentAt,

          lastStatus:
            updatedOrder.pendingMail
              ?.lastStatus,
        },
      },
    });
  } catch (error) {
    console.error(
      "sendPendingPurchaseMail error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while sending the email",
    });
  }
};

export default sendPendingPurchaseMail;