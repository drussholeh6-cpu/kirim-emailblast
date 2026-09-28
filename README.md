# MailBlast

MailBlast adalah antarmuka demo untuk mengelola kontak, menyusun template email, dan mensimulasikan pengiriman massal. Backend opsional menyediakan endpoint untuk mengirim email melalui Resend.

## Struktur Proyek

- `index.html` - halaman aplikasi.
- `styles.css` - CSS khusus.
- `tailwind.config.js` - konfigurasi Tailwind CSS.
- `app.js` - logika antarmuka dan simulator browser.
- `server.js` - backend Express dengan endpoint Resend.

## Menjalankan Antarmuka

Buka `index.html` di browser. Tailwind CSS, ikon, grafik, dan font dimuat dari CDN, jadi browser perlu akses internet.

Antarmuka berjalan dalam mode simulasi. Backend di bawah ini berdiri sendiri dan belum dihubungkan dengan tombol simulator pada halaman.

## Menjalankan Backend Resend

Persyaratan: Node.js dan npm.

Pasang dependensi dari direktori proyek:

```bash
npm install express cors resend
node server.js
```

Server berjalan di `http://localhost:3000`.

Sebelum mengirim email sungguhan, buka `server.js` dan ganti nilai API key placeholder dengan API key Resend yang valid. Jangan masukkan API key sungguhan ke repositori atau membagikannya di sisi browser.

## Endpoint Pengiriman

`POST /api/send-bulk-email`

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
  "senderEmail": "info@domainanda.com"
}
```

Backend mengganti `{{nama_depan}}` pada konten email berdasarkan nama penerima, lalu mengirim email satu per satu. Respons sukses berisi `success: true` dan daftar hasil pengiriman; kegagalan mengembalikan status HTTP 500 beserta pesan error.

## Catatan

Backend ini masih berupa contoh dasar. Sebelum digunakan di lingkungan produksi, tambahkan validasi input, autentikasi, pembatasan laju, penanganan kegagalan per penerima, dan pengelolaan API key melalui environment variable atau secret manager.
