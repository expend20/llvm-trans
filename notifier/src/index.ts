import express from 'express';
import router from 'express';
import nodemailer from 'nodemailer';
import { json } from 'body-parser';

const app = express();
app.use(json());

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post('/api/notifier', async (req, res) => {
  console.log(`Received request: ${JSON.stringify(req.body)}`);
  try {
    const { subject, text } = req.body;

    if (!subject || !text) {
      return res.status(400).json({ error: 'Subject and text are required' });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DESTINATION,
      subject: subject,
      text: text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully', messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.use('/api/notifier', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Notifier listening on port ${port}`);
});
