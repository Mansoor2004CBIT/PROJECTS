const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, 
  'http://localhost:5173', 
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser tools like curl/postman
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

app.use(express.json());

// GET /api/projects
app.get('/', (req, res) => {
  const p = path.join(__dirname, 'projects.json');
  try {
    const data = fs.readFileSync(p, 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json([{ title: 'Example', description: 'Demo project' }]);
  }
});

// POST /api/contact
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email and message required.' });

  try {
    // create transporter using SMTP details from .env
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\nFrom: ${name} <${email}>`,
      html: `<p>${message}</p><p>From: ${name} &lt;${email}&gt;</p>`
    };

    await transporter.sendMail(mailOptions);
    res.json({ ok: true });
  } catch (err) {
    console.error('Mail error:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

