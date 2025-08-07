const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy POST /api/purchase to the real API
app.post('/api/purchase', async (req, res) => {
  try {
    const apiUrl = 'https://api.qa.bltelecoms.net/v2/trade/voucher/variable/sales';
    const { requestId, amount } = req.body;
    // Always use productId 13 as per your frontend
    const payload = {
      requestId,
      productId: 13,
      amount,
    };
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'apikey': '3d177d99-2edd-4249-944b-fec5c820421a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy GET /api/electricity-confirm to the real API
app.get('/api/electricity-confirm', async (req, res) => {
  try {
    const { amount, 'meter-number': meterNumber, 'mobile-number': mobileNumber, 'voucher-token': voucherToken } = req.query;
    const params = new URLSearchParams({
      amount,
      'meter-number': meterNumber,
      'mobile-number': mobileNumber,
      'voucher-token': voucherToken,
    });
    const apiUrl = `https://api.qa.bltelecoms.net/v2/trade/voucher/electricity/confirm?${params.toString()}`;
    const apiRes = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'apikey': '3d177d99-2edd-4249-944b-fec5c820421a',
      },
    });
    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log('[ELECTRICITY CONFIRM] Upstream status:', apiRes.status);
    console.log('[ELECTRICITY CONFIRM] Upstream body:', data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Proxy POST /api/electricity-vend to the real API
app.post('/api/electricity-vend', async (req, res) => {
  try {
    const { requestId, conversationId, reference } = req.body;
    const payload = { requestId, conversationId, reference };
    const apiUrl = 'https://api.qa.bltelecoms.net/v2/trade/voucher/electricity/sales';
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'apikey': '3d177d99-2edd-4249-944b-fec5c820421a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log('[ELECTRICITY VEND] Upstream status:', apiRes.status);
    console.log('[ELECTRICITY VEND] Upstream body:', data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
}); 