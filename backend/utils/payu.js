import crypto from "crypto";

import {
  PAYU_KEY,
  PAYU_SALT,
  PAYU_VERIFY_URL,
} from "../config/payu.js";

// ======================================================
// SHA-512
// ======================================================

export const sha512 = (value) => {
  return crypto
    .createHash("sha512")
    .update(String(value))
    .digest("hex");
};

// ======================================================
// GENERATE TRANSACTION ID
// ======================================================

export const generateTransactionId = () => {
  return `TT_${Date.now()}_${crypto
    .randomBytes(6)
    .toString("hex")}`;
};

// ======================================================
// GENERATE PAYU PAYMENT HASH
// ======================================================

export const generatePaymentHash = ({
  key,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  salt,
}) => {
  const udf1 = "";
  const udf2 = "";
  const udf3 = "";
  const udf4 = "";
  const udf5 = "";

  const hashString =
    `${key}|${txnid}|${amount}|${productinfo}|` +
    `${firstname}|${email}|` +
    `${udf1}|${udf2}|${udf3}|${udf4}|${udf5}` +
    `||||||${salt}`;

  return sha512(hashString);
};

// ======================================================
// VERIFY PAYU CALLBACK HASH
// ======================================================

export const verifyPayUResponseHash = (
  data,
  salt
) => {
  try {
    const {
      status = "",
      udf1 = "",
      udf2 = "",
      udf3 = "",
      udf4 = "",
      udf5 = "",
      email = "",
      firstname = "",
      productinfo = "",
      amount = "",
      txnid = "",
      key = "",
      hash = "",
      additionalCharges,
      additional_charges,
    } = data;

    if (!hash) {
      return false;
    }

    const additional =
      additionalCharges ||
      additional_charges;

    let reverseHashString =
      `${salt}|${status}||||||` +
      `${udf5}|${udf4}|${udf3}|${udf2}|${udf1}|` +
      `${email}|${firstname}|${productinfo}|` +
      `${amount}|${txnid}|${key}`;

    if (additional) {
      reverseHashString =
        `${additional}|${reverseHashString}`;
    }

    const calculatedHash =
      sha512(reverseHashString)
        .toLowerCase();

    const receivedHash =
      String(hash).toLowerCase();

    const receivedBuffer =
      Buffer.from(receivedHash);

    const calculatedBuffer =
      Buffer.from(calculatedHash);

    if (
      receivedBuffer.length !==
      calculatedBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(
      receivedBuffer,
      calculatedBuffer
    );
  } catch (error) {
    console.error(
      "PayU hash verification error:",
      error
    );

    return false;
  }
};

// ======================================================
// VERIFY TRANSACTION DIRECTLY WITH PAYU
// ======================================================

export const verifyTransactionWithPayU =
  async (txnid) => {
    try {
      if (!txnid) {
        throw new Error(
          "Transaction ID is required."
        );
      }

      if (
        !PAYU_KEY ||
        !PAYU_SALT ||
        !PAYU_VERIFY_URL
      ) {
        throw new Error(
          "PayU configuration is missing."
        );
      }

      const command =
        "verify_payment";

      /*
       * PayU general API hash:
       *
       * sha512(
       *   key|command|var1|salt
       * )
       *
       * var1 = txnid
       */

      const hash =
        sha512(
          `${PAYU_KEY}|${command}|${txnid}|${PAYU_SALT}`
        );

      const body =
        new URLSearchParams();

      body.append(
        "key",
        PAYU_KEY
      );

      body.append(
        "command",
        command
      );

      body.append(
        "var1",
        txnid
      );

      body.append(
        "hash",
        hash
      );

      const response =
        await fetch(
          PAYU_VERIFY_URL,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/x-www-form-urlencoded",
            },

            body:
              body.toString(),
          }
        );

      const responseText =
        await response.text();

      if (!response.ok) {
        console.error(
          "PayU Verify HTTP Error:",
          response.status,
          responseText
        );

        throw new Error(
          `PayU verification failed with HTTP ${response.status}`
        );
      }

      let result;

      try {
        result =
          JSON.parse(
            responseText
          );
      } catch {
        console.error(
          "Invalid PayU verification response:",
          responseText
        );

        throw new Error(
          "Invalid response received from PayU."
        );
      }

      const transaction =
        result
          ?.transaction_details
          ?.[txnid];

      if (!transaction) {
        console.error(
          "Transaction not found in PayU response:",
          txnid
        );

        return null;
      }

      return transaction;
    } catch (error) {
      console.error(
        "verifyTransactionWithPayU error:",
        error
      );

      throw error;
    }
  };

// ======================================================
// GENERATE SECURE BOOK ACCESS TOKEN
// ======================================================

export const generateDownloadToken = () => {
  return crypto
    .randomBytes(32)
    .toString("hex");
};

// ======================================================
// HASH BOOK ACCESS TOKEN
// ======================================================

export const hashDownloadToken = (
  token
) => {
  if (!token) {
    throw new Error(
      "Access token is required."
    );
  }

  return crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");
};