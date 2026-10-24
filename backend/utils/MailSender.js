// import Nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// import { MailtrapTransport } from "mailtrap";
// dotenv.config();

// const sender = {
//   address: "no-reply@targettrek.in",
//   name: "Target Trek",
// };


// const transport = Nodemailer.createTransport(
//   MailtrapTransport({
//     token: process.env.MAILTRAP_TOKEN,
//   })
// );

// // const sendMail = (toEmail, subject, text, htmlContent) => {
// //   const recipients = [
// //     toEmail
// //   ];
// //    transport.sendMail({
// //     from: sender,
// //     to: recipients,
// //     subject: subject,
// //     text: text,
// //     html:htmlContent,
// //   })
// //   .then(console.log, console.error);
// // };
// const sendMail = (toEmail, subject, text, htmlContent) => {
//   const recipients = [toEmail];

//   const mailPromise = transport.sendMail({
//     from: sender,
//     to: recipients,
//     subject,
//     text,
//     html: htmlContent,
//   });

//   mailPromise
//     .then((info) => {
//       console.log("Mail sent:", info);
//     })
//     .catch((error) => {
//       console.error("Mail error:", error);
//     });

//   return mailPromise;
// };


// export default sendMail;



import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { MailtrapTransport } from "mailtrap";

dotenv.config();

/* =====================================================
   CONFIGURATION
===================================================== */

const sender = {
  address: "no-reply@targettrek.in",
  name: "Target Trek",
};

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

/* =====================================================
   ATTACHMENT NORMALIZATION

   Handles:
   - Base64-encoded ICS attachments
   - Buffers
   - Ordinary text attachments
   - Other Nodemailer attachment options

   IMPORTANT:
   interviewMail.js already Base64-encodes its
   ICS file. We decode it to a Buffer here so
   Nodemailer/Mailtrap handles it correctly.
===================================================== */

function normalizeAttachments(attachments = []) {
  if (!Array.isArray(attachments)) {
    throw new Error(
      "attachments must be an array"
    );
  }

  return attachments.map(
    (attachment, index) => {
      if (!attachment?.filename) {
        throw new Error(
          `Attachment ${index} is missing filename`
        );
      }

      const contentType =
        attachment.contentType ||
        attachment.type ||
        "application/octet-stream";

      let content = attachment.content;

      if (
        content === undefined ||
        content === null
      ) {
        throw new Error(
          `Attachment ${index} has no content`
        );
      }

      /*
        The interview email service generates
        an ICS string encoded as Base64.

        Decode it into a Buffer before giving
        it to Nodemailer.
      */

      if (
        typeof content === "string" &&
        attachment.filename
          .toLowerCase()
          .endsWith(".ics")
      ) {
        content = Buffer.from(
          content,
          "base64"
        );
      }

      return {
        filename: attachment.filename,
        content,
        contentType,

        contentDisposition:
          attachment.contentDisposition ||
          attachment.disposition ||
          "attachment",

        ...(attachment.cid
          ? { cid: attachment.cid }
          : {}),
      };
    }
  );
}

/* =====================================================
   SEND MAIL

   Compatible with existing calls:

   sendMail(to, subject, text, html)

   Also supports:

   sendMail(to, subject, text, html, {
     replyTo,
     attachments,
     icalEvent
   })

===================================================== */

const sendMail = async (
  toEmail,
  subject,
  text,
  htmlContent,
  options = {}
) => {
  if (!process.env.MAILTRAP_TOKEN) {
    throw new Error(
      "MAILTRAP_TOKEN is missing"
    );
  }

  const recipients =
    Array.isArray(toEmail)
      ? toEmail
      : [toEmail];

  if (!recipients.length) {
    throw new Error(
      "At least one recipient is required"
    );
  }

  const attachments =
    options.attachments?.length
      ? normalizeAttachments(
          options.attachments
        )
      : [];

  const mailOptions = {
    from: sender,
    to: recipients,
    subject,
    text,
    html: htmlContent,

    ...(options.replyTo
      ? {
          replyTo:
            options.replyTo,
        }
      : {}),

    ...(attachments.length
      ? {
          attachments,
        }
      : {}),

    ...(options.icalEvent
      ? {
          icalEvent:
            options.icalEvent,
        }
      : {}),
  };

  try {
    const info =
      await transport.sendMail(
        mailOptions
      );

    const messageId =
      info?.messageId ||
      info?.message_id ||
      info?.message_ids?.[0] ||
      info?.response?.message_ids?.[0] ||
      null;

    console.log(
      "[MAIL SENT]",
      {
        messageId:
          messageId ||
          "Not provided by transport",

        recipients: recipients.length,

        attachments:
          attachments.map(
            (attachment) =>
              attachment.filename
          ),
      }
    );

    return (
      info || {
        accepted: recipients,
        submitted: true,
      }
    );
  } catch (error) {
    console.error(
      "[MAIL SEND FAILED]",
      {
        message:
          error.message,

        code:
          error.code,

        subject,

        attachments:
          attachments.map(
            (attachment) =>
              attachment.filename
          ),
      }
    );

    throw error;
  }
};

export default sendMail;
