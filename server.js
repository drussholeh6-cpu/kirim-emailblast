const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
app.use(cors());
app.use(express.json());

// Masukkan API Key Resend Anda di sini (atau via environment variable)
const resend = new Resend('re_123456789_KODE_API_KEY_RESEND_ANDA');

// Endpoint API untuk mengirim email
app.post('/api/send-bulk-email', async (req, res) => {
  const { recipients, subject, htmlContent, senderName, senderEmail } = req.body;

  try {
    const results = [];
    
    // Kirim email satu per satu (atau per batch)
    for (const recipient of recipients) {
      const data = await resend.emails.send({
        from: `${senderName} <${senderEmail}>`, // Contoh: Admin <info@domainanda.my.id>
        to: recipient.email,
        subject: subject,
        html: htmlContent.replace(/{{nama_depan}}/g, recipient.name || ''),
      });
      results.push({ email: recipient.email, id: data.id, status: 'success' });
    }

    res.json({ success: true, results });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server Backend berjalan di http://localhost:3000');
});