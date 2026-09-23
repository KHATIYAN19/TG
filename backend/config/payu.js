const isProduction =
  process.env.PAYU_MODE === "production";

export const PAYU_PAYMENT_URL = isProduction
  ? "https://secure.payu.in/_payment"
  : "https://test.payu.in/_payment";

export const PAYU_VERIFY_URL = isProduction
  ? "https://info.payu.in/merchant/postservice.php?form=2"
  : "https://test.payu.in/merchant/postservice.php?form=2";

export const PAYU_KEY = process.env.PAYU_KEY;
export const PAYU_SALT = process.env.PAYU_SALT;