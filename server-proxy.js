const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

const API_KEY = '3d177d99-2edd-4249-944b-fec5c820421a';

app.use(cors());
app.use(express.json());

// Proxy POST /api/redeem-voucher
app.post('/api/redeem-voucher', async (req, res) => {
  try {
    console.log('\n--- [REDEEM] Request ---\n', req.body);
    
    const { token, amount } = req.body;
    const requestId = crypto.randomUUID();
    
    const payload = {
      requestId,
      token,
      amount
    };

    console.log('Payload:', payload);

    const response = await fetch('https://api.qa.bltelecoms.net/v2/trade/voucher/variable/redemptions', {
      method: 'POST',
      headers: {
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Trade-Vend-Channel': 'api',
        'apikey': API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('\n--- [REDEEM] Response ---\n', data);
    
    res.status(response.status).json(data);
  } catch (error) {
    console.error('\n--- [REDEEM] Error ---\n', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});