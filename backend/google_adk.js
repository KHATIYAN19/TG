import express from "express";

const router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://www.targettrek.in";

const EBOOK_PRICE = 1;

const EBOOK_PDF_URL =process.env.EBOOK_PDF_URL

router.post("/success", (req, res) => {
  try {
    const data = req.body;
    if (data.status !== "success") {
      return res.redirect(
        `${FRONTEND_URL}/ebook/adk/payment/failed`
      );

    }
const receivedAmount = Number.parseFloat(data.amount);

if (!Number.isFinite(receivedAmount) || receivedAmount !== EBOOK_PRICE) {
  console.log("Amount mismatch:", {
    received: data.amount,
    parsed: receivedAmount,
    expected: EBOOK_PRICE,
  });

  return res.redirect(
    `${FRONTEND_URL}/ebook/adk/payment/failed`
  );
}
    if (!EBOOK_PDF_URL) {

      console.error(
        "ADK_EBOOK_PDF_URL is not configured"
      );

      return res.redirect(
        `${FRONTEND_URL}/payment/failed`
      );

    }

    const encodedPdfUrl =
      encodeURIComponent(EBOOK_PDF_URL);

    return res.redirect(
      `${FRONTEND_URL}/ebook/adk/payment/success?pdf=${encodedPdfUrl}`
    );

  } catch (error) {

    console.error(
      "Google ADK PayU success error:",
      error
    );

    return res.redirect(
      `${FRONTEND_URL}/payment/failed`
    );

  }

});

router.post("/failure", (req, res) => {
  return res.redirect(
    `${FRONTEND_URL}/ebook/adk/payment/failed`
  );

});


export default router;
