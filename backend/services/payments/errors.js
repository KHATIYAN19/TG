/*
  One error type for everything the payment processor does.
  `status` is OUR http status (never a gateway's), `code` is a stable machine-readable id,
  `message` is safe to show to a buyer. The gateway's own detail goes in `detail` (log it, don't show it).
*/
export class PaymentError extends Error {
  constructor(status, message, code = "PAYMENT_ERROR", detail = null) {
    super(message);
    this.name = "PaymentError";
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}
