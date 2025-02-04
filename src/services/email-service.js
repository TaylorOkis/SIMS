import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const sendEmail = async (email, emailHtml) => {
  const mailTransporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailDetails = {
    from: `SIMS <${process.env.EMAIL}>`,
    to: email,
    subject: "PASSWORD RESET",
    html: emailHtml,
  };

  try {
    await mailTransporter.sendMail(mailDetails);
    return true;
  } catch (error) {
    console.error("Email sending failed.", error);
    return false;
  }
};

export default sendEmail;
