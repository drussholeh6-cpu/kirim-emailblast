import { Resend } from 'resend';

// Vercel akan membaca API Key ini dari Environment Variables secara otomatis
const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Hanya menerima HTTP Method POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Hanya menerima request POST' });
  }

  const { recipients, subject, htmlContent, senderName, senderEmail } = req.body;

  // Validasi input dasar
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return res.status(400).json({ error: 'Daftar penerima (recipients) tidak boleh kosong' });
  }

  try {
    const results = [];

    // Kirim email ke setiap penerima di dalam array/daftar
    for (const recipient of recipients) {
      // Mengganti tag {{nama_depan}} jika ada di dalam template HTML
      const personalizedHtml = htmlContent.replace(
        /{{nama_depan}}/g,
        recipient.name || ''
      );

      const data = await resend.emails.send({
        from: `${senderName} <${senderEmail}>`, // Contoh: Promo <info@domainanda.my.id>
        to: recipient.email,
        subject: subject,
        html: personalizedHtml,
      });

      results.push({ email: recipient.email, id: data.id, status: 'success' });
    }

    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error('Error pengiriman email:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}