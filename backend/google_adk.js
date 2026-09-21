import express from "express";

const router = express.Router();

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://www.targettrek.in";

const EBOOK_PRICE = Number.parseFloat(
  process.env.GOOGLE_ADK_PRICE
);

const EBOOK_PDF_URL = process.env.EBOOK_PDF_URL;

router.post("/success", (req, res) => {
  try {
    const data = req.body;

    if (data.status !== "success") {
      return res.redirect(
        `${FRONTEND_URL}/ebook/adk/payment/failed`
      );
    }

    // Check that GOOGLE_ADK_PRICE is properly configured
    if (!Number.isFinite(EBOOK_PRICE)) {
      console.error(
        "GOOGLE_ADK_PRICE is not configured or is invalid"
      );

      return res.redirect(
        `${FRONTEND_URL}/ebook/adk/payment/failed`
      );
    }

    const receivedAmount = Number.parseFloat(data.amount);

    if (
      !Number.isFinite(receivedAmount) ||
      receivedAmount !== EBOOK_PRICE
    ) {
      console.error(
        `ADK payment amount mismatch. Expected: ${EBOOK_PRICE}, Received: ${receivedAmount}`
      );

      return res.redirect(
        `${FRONTEND_URL}/ebook/adk/payment/failed`
      );
    }

    if (!EBOOK_PDF_URL) {
      console.error(
        "EBOOK_PDF_URL is not configured"
      );

      return res.redirect(
        `${FRONTEND_URL}/ebook/adk/payment/failed`
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
      `${FRONTEND_URL}/ebook/adk/payment/failed`
    );
  }
});


router.get("/success", (req, res) => {
  try {
    if (!EBOOK_PDF_URL) {
      console.error(
        "EBOOK_PDF_URL is not configured"
      );

      return res.redirect(
        `${FRONTEND_URL}/ebook/adk/payment/failed`
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
      `${FRONTEND_URL}/ebook/adk/payment/failed`
    );
  }
});


router.post("/failure", (req, res) => {
  return res.redirect(
    `${FRONTEND_URL}/ebook/adk/payment/failed`
  );
});


router.get("/failure", (req, res) => {
  return res.redirect(
    `${FRONTEND_URL}/ebook/adk/payment/failed`
  );
});




export default router;
