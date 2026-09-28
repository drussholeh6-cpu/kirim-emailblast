const express = require('express');
const sendBulkEmail = require('./email-handler');

const app = express();
app.use(express.json({ limit: '1mb' }));
app.post('/api/send-email', sendBulkEmail);
app.use(express.static(__dirname));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
});