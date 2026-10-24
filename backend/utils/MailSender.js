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

const sender = {
  address: "no-reply@targettrek.in",
  name: "Target Trek",
};

const transport = nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

// ADD THIS DEBUG
console.log("[MAIL TRANSPORT DEBUG]", {
  transporterType:
    transport.transporter?.constructor?.name,
  host:
    transport.transporter?.options?.host,
  port:
    transport.transporter?.options?.port,
  tokenConfigured:
    Boolean(process.env.MAILTRAP_TOKEN),
});

const sendMail = async (
  toEmail,
  subject,
  text,
  htmlContent,
  options = {}
) => {
  if (!process.env.MAILTRAP_TOKEN) {
    throw new Error("MAILTRAP_TOKEN is missing");
  }

  const recipients = Array.isArray(toEmail)
    ? toEmail
    : [toEmail];

  const info = await transport.sendMail({
    from: sender,
    to: recipients,
    subject,
    text,
    html: htmlContent,
    ...(options.replyTo
      ? { replyTo: options.replyTo }
      : {}),
    ...(options.attachments?.length
      ? { attachments: options.attachments }
      : {}),
    ...(options.icalEvent
      ? { icalEvent: options.icalEvent }
      : {}),
  });

  console.log("[MAIL SENT]", info.messageId);

  return info;
};

export default sendMail;