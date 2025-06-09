// File: api/apply.js

const multer = require('multer');
const nodemailer = require('nodemailer');
const fs = require('fs');

// We need to wrap multer so it works in Vercel's Lambda environment
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'docs',   maxCount: 1 },
]);

// Initialize Nodemailer transporter using environment variables
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Vercel serverless handler: expects multipart/form-data.
 * We parse the form with multer, then send an email.
 */
module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // First, parse multipart/form-data using multer:
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      // Extract text fields
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

      // Extract uploaded files (in memory)
      const resumeFile = req.files['resume']?.[0];
      const docsFile   = req.files['docs']?.[0];
      if (!resumeFile || !docsFile) {
        return res.status(400).json({ error: 'Both PDF files are required.' });
      }

      // Build the email with attachments (buffer → attachment)
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New Teacher Application: ${fullName} <${email}>`,
        text: `
A new teacher application has arrived:

Full Name: ${fullName}
Email: ${email}
Phone: ${phone}
Subjects: ${subjects}
Qualification: ${qualification}
Vocational Instructor: ${isVocational ? 'Yes' : 'No'}
Has Equipment: ${hasEquipment ? 'Yes' : 'No'}
Space for 5: ${hasSmallClassSpace ? 'Yes' : 'No'}
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
            content: resumeFile.buffer,
          },
          {
            filename: docsFile.originalname,
            content: docsFile.buffer,
          },
        ],
      };

      // Send mail
      await transporter.sendMail(mailOptions);

      // Respond success
      return res.json({ success: true, message: 'Application submitted successfully.' });
    } catch (sendErr) {
      console.error('Error sending mail:', sendErr);
      return res.status(500).json({ error: 'Server error occurred.' });
    }
  });
};
