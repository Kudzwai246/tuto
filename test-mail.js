// test-mail.js
require('dotenv').config();
const nodemailer = require('nodemailer');

async function sendTest() {
  let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  let info = await transporter.sendMail({
    from: `"Tuto Test" <${process.env.SMTP_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: "🚀 SMTP Test",
    text: "If you see this email, SMTP is working!"
  });

  console.log("Message sent:", info.messageId);
}

sendTest().catch(console.error);
