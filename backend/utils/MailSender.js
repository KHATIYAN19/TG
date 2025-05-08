import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER,
      pass: process.env.pass
    }
  });
};

const sendMail = (toEmail, subject, text, htmlContent) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: 'placementconnect9@gmail.com',
    to: toEmail,
    subject: subject,
    text: text,
    html: htmlContent
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email: ', error);
    } else {
      console.log('Email sent successfully: ', info.response);
    }
  });
};

export default sendMail;
