import Nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { MailtrapTransport } from "mailtrap";
dotenv.config();

const sender = {
  address: "no-reply@targettrek.in",
  name: "Target Trek",
};


const transport = Nodemailer.createTransport(
  MailtrapTransport({
    token: process.env.MAILTRAP_TOKEN,
  })
);

// const sendMail = (toEmail, subject, text, htmlContent) => {
//   const recipients = [
//     toEmail
//   ];
//    transport.sendMail({
//     from: sender,
//     to: recipients,
//     subject: subject,
//     text: text,
//     html:htmlContent,
//   })
//   .then(console.log, console.error);
// };
const sendMail = (toEmail, subject, text, htmlContent) => {
  const recipients = [toEmail];

  const mailPromise = transport.sendMail({
    from: sender,
    to: recipients,
    subject,
    text,
    html: htmlContent,
  });

  mailPromise
    .then((info) => {
      console.log("Mail sent:", info);
    })
    .catch((error) => {
      console.error("Mail error:", error);
    });

  return mailPromise;
};


export default sendMail;