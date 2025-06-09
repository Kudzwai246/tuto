// index.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/** 1) Enable CORS so your static front-end can call this API **/
app.use(
  cors({
    origin: [process.env.FRONTEND_ORIGIN || 'http://localhost:5500'],
    methods: ['POST', 'GET'],
  })
);

// 2) Configure Multer to save uploaded PDFs into ./uploads/
const upload = multer({
  dest: path.join(__dirname, 'uploads/'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max per file
});

/** 3) Configure Nodemailer to send email via Gmail SMTP **/
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // your Gmail address
    pass: process.env.SMTP_PASS, // your app‐password or OAuth token
  },
});

/**
 * POST /apply
 *   Expects multipart/form-data with these fields:
 *     - fullName, email, phone, subjects, qualification, bio,
 *       isVocational, hasEquipment, hasSmallClassSpace,
 *       password, latitude, longitude,
 *       resume (PDF file), docs (PDF file)
 */
app.post(
  '/apply',
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'docs', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // 1) Extract form fields
      const {
        fullName,
        email,
        phone,
        subjects,
        qualification,
        bio,
        isVocational,
        hasEquipment,
        hasSmallClassSpace,
        password,
        latitude,
        longitude,
      } = req.body;

      // 2) Extract uploaded files
      const resumeFile = req.files['resume']?.[0];
      const docsFile = req.files['docs']?.[0];
      if (!resumeFile || !docsFile) {
        return res.status(400).json({ error: 'Both PDF files are required.' });
      }

      // 3) Build email details
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL, // where applications arrive
        subject: `New Teacher Application: ${fullName} <${email}>`,
        text: `
A new teacher application has arrived:

Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
Subjects: ${subjects}
Qualification: ${qualification}
Vocational Instructor: ${isVocational === 'on' ? 'Yes' : 'No'}
Has Equipment: ${hasEquipment === 'on' ? 'Yes' : 'No'}
Space for 5: ${hasSmallClassSpace === 'on' ? 'Yes' : 'No'}
Bio:
${bio}

Location:
Latitude = ${latitude}
Longitude = ${longitude}

(See attached PDFs for Resume & Qualification Docs.)
        `,
        attachments: [
          {
            filename: resumeFile.originalname,
            path: resumeFile.path,
          },
          {
            filename: docsFile.originalname,
            path: docsFile.path,
          },
        ],
      };

      // 4) Send email with attachments
      await transporter.sendMail(mailOptions);

      // 5) Delete files from local storage
      fs.unlinkSync(resumeFile.path);
      fs.unlinkSync(docsFile.path);

      // 6) Respond to the front-end
      return res.json({ success: true, message: 'Application submitted successfully.' });
    } catch (err) {
      console.error('Error in /apply:', err);
      return res
        .status(500)
        .json({ error: 'Something went wrong. Please try again later.' });
    }
  }
);

app.listen(PORT, () => {
  console.log(`🌐 Tuto backend listening on port ${PORT}`);
});
