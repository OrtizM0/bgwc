// suggestions.js
// Express route for handling board game suggestion submissions
// Sends suggestion emails to the site admin using Nodemailer

const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();
require('dotenv').config(); // Load environment variables from .env file

// Configure Nodemailer transporterr using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Email address from .env
    pass: process.env.EMAIL_PASS  // Gmail app password from .env
  }
});

// POST endpoint for suggestions
router.post('/api/suggestions', async (req, res) => {
  const { suggestion, email } = req.body;

  // Validate request body
  if (!suggestion || suggestion.trim() === '') {
    return res.status(400).json({ error: 'Suggestion is required.' });
  }

  // Prepare email content
  const mailOptions = {
    from: email || `"Anonymous" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: 'New Board Game Suggestion',
    text: `Suggestion:\n\n${suggestion.trim()}\n\nFrom: ${email || 'Anonymous'}`
  };

  try {
    // Send email using Nodemailer
    await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send suggestion.' });
    }
});

module.exports = router;