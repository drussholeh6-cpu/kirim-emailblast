# MailBlast

MailBlast adalah antarmuka demo untuk mengelola kontak, menyusun template email, dan mensimulasikan pengiriman massal. Backend opsional menyediakan endpoint untuk mengirim email melalui Resend.

## Struktur Proyek

- `index.html` - halaman aplikasi.
- `styles.css` - CSS khusus.
- `tailwind.config.js` - konfigurasi Tailwind CSS.
- `app.js` - logika antarmuka dan simulator browser.
- `server.js` - server lokal untuk frontend dan endpoint Resend.
- `email-handler.js` - handler pengiriman bersama untuk Express dan function serverless.
- `api/send-email.js` - entry point function serverless.

## Menjalankan Antarmuka

Jalankan server lokal agar frontend dapat mengakses backend pada origin yang sama. Tailwind CSS, ikon, grafik, dan font dimuat dari CDN, jadi browser perlu akses internet.

## Menjalankan Backend Resend

Persyaratan: Node.js 18+ dan npm.

Pasang dependensi dan atur environment variable di PowerShell:

```bash
npm install
$env:RESEND_API_KEY="re_..."
$env:RESEND_FROM_EMAIL="email@domain-terverifikasi.com"
$env:RESEND_FROM_NAME="MailBlast"
npm start
```

Buka `http://localhost:3000`. Tombol "Kirim Tes" dan kampanye akan mengirim request ke `/api/send-email`. Pengirim harus memakai domain yang sudah diverifikasi di Resend. Jangan masukkan API key ke frontend atau commit file `.env`.

Untuk deploy ke Vercel, hubungkan repository lalu atur `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, dan opsional `RESEND_FROM_NAME` di Project Settings > Environment Variables. Function serverless menggunakan route yang sama.

## Endpoint Pengiriman

`POST /api/send-email`

Header:

```text
Content-Type: application/json
```

Contoh body:

```json
{
  "recipients": [
    { "name": "Budi Santoso", "email": "budi@example.com" }
  ],
  "subject": "Halo {{nama_depan}}",
  "htmlContent": "<p>Selamat datang, {{nama_depan}}!</p>",
  "senderName": "MailBlast",
  "replyTo": "support@domainanda.com"
}
```

Backend mengisi tag `{{nama_depan}}`, `{{nama_belakang}}`, `{{perusahaan}}`, `{{email}}`, dan `{{tanggal}}`, lalu mengirim email satu per satu. Maksimal 50 penerima per request. Respons memuat status masing-masing penerima; `Sent` berarti provider menerima request, bukan jaminan email sudah masuk inbox.

## Catatan

Backend ini masih contoh dasar. Sebelum digunakan secara publik, tambahkan autentikasi, pembatasan laju, penyimpanan kontak/log terpusat, serta alur unsubscribe dan kepatuhan email.
