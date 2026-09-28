const { Resend } = require('resend');

function personalize(value, recipient) {
  const names = (recipient.name || '').trim().split(/\s+/);
  const replacements = {
    nama_depan: names[0] || '',
    nama_belakang: names.slice(1).join(' '),
    perusahaan: recipient.company || '',
    email: recipient.email,
    tanggal: new Date().toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };

  return value.replace(/{{(nama_depan|nama_belakang|perusahaan|email|tanggal)}}/g, (_, key) => replacements[key]);
}

module.exports = async function sendBulkEmail(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Hanya menerima request POST' });
  }

  const { recipients, subject, htmlContent, senderName, replyTo } = req.body || {};
  const apiKey = process.env.RESEND_API_KEY;
  const senderEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !senderEmail) {
    return res.status(503).json({ error: 'Konfigurasi email server belum lengkap' });
  }

  if (
    !Array.isArray(recipients) ||
    recipients.length === 0 ||
    recipients.length > 50 ||
    !recipients.every(recipient => recipient && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email || '')) ||
    typeof subject !== 'string' ||
    !subject.trim() ||
    typeof htmlContent !== 'string' ||
    !htmlContent.trim()
  ) {
    return res.status(400).json({ error: 'Data email tidak valid (maksimal 50 penerima per batch)' });
  }

  const resend = new Resend(apiKey);
  const safeSenderName = (process.env.RESEND_FROM_NAME || senderName || 'MailBlast').replace(/[<>\r\n]/g, '').trim();
  const results = [];

  for (const recipient of recipients) {
    try {
      const { data, error } = await resend.emails.send({
        from: `${safeSenderName} <${senderEmail}>`,
        to: recipient.email,
        subject: personalize(subject, recipient),
        html: personalize(htmlContent, recipient),
        ...(replyTo ? { replyTo } : {})
      });

      results.push(error
        ? { email: recipient.email, status: 'failed', error: error.message }
        : { email: recipient.email, id: data.id, status: 'success' });
    } catch (error) {
      results.push({ email: recipient.email, status: 'failed', error: error.message });
    }
  }

  const success = results.every(result => result.status === 'success');
  return res.status(success ? 200 : 207).json({ success, results });
};