const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health and root routes
app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'proxy', port: PORT, time: new Date().toISOString() });
});
app.get('/', (req, res) => {
  res.type('text/plain').send('Proxy server is running');
});

// Proxy POST /api/purchase to the real API
app.post('/api/purchase', async (req, res) => {
  try {
    console.log('\n--- [PURCHASE] Incoming Request ---');
    console.log('Body:', req.body);
    const apiUrl = 'https://api.qa.bltelecoms.net/v2/trade/voucher/variable/sales';
    const { requestId, amount } = req.body;
    const payload = {
      requestId,
      productId: 13,
      amount,
    };
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        apikey: '3d177d99-2edd-4249-944b-fec5c820421a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log('[PURCHASE] Upstream API Status:', apiRes.status);
    console.log('[PURCHASE] Upstream API Response:', data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('[PURCHASE] Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy POST /api/redeem-airtime to the real API
app.post('/api/redeem-airtime', async (req, res) => {
  try {
    console.log('\n--- [REDEEM AIRTIME] Incoming Request ---');
    console.log('Body:', req.body);
    const { requestId, mobileNumber, tokenNumber, amount } = req.body;
    const apiUrl = 'https://api.qa.bltelecoms.net/v2/trade/voucher/variable/vouchers/airtime/redemption';
    const payload = { requestId, mobileNumber, tokenNumber, amount };
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        apikey: '3d177d99-2edd-4249-944b-fec5c820421a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const text = await apiRes.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    console.log('[REDEEM AIRTIME] Upstream API Status:', apiRes.status);
    console.log('[REDEEM AIRTIME] Upstream API Response:', data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('[REDEEM AIRTIME] Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy GET /api/electricity-confirm to the real API
app.get('/api/electricity-confirm', async (req, res) => {
  try {
    console.log('\n--- [ELECTRICITY CONFIRM] Incoming Request ---');
    console.log('Query:', req.query);
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
        accept: 'application/json',
        apikey: '3d177d99-2edd-4249-944b-fec5c820421a',
      },
    });
    const text = await apiRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    console.log('[ELECTRICITY CONFIRM] Upstream API Status:', apiRes.status);
    console.log('[ELECTRICITY CONFIRM] Upstream API Response:', data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('[ELECTRICITY CONFIRM] Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy POST /api/electricity-vend to the real API
app.post('/api/electricity-vend', async (req, res) => {
  try {
    console.log('\n--- [ELECTRICITY VEND] Incoming Request ---');
    console.log('Body:', req.body);
    const { requestId, conversationId, reference } = req.body;
    const payload = { requestId, conversationId, reference };
    const apiUrl = 'https://api.qa.bltelecoms.net/v2/trade/voucher/electricity/sales';
    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        apikey: '3d177d99-2edd-4249-944b-fec5c820421a',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const text = await apiRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    console.log('[ELECTRICITY VEND] Upstream API Status:', apiRes.status);
    console.log('[ELECTRICITY VEND] Upstream API Response:', data);
    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('[ELECTRICITY VEND] Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Proxy POST /api/redeem-voucher to the real API
app.post('/api/redeem-voucher', async (req, res) => {
  try {
    console.log('\n--- [REDEEM VOUCHER] Incoming Request ---');
    console.log('Body:', req.body);
    
    const apiUrl = 'https://api.qa.bltelecoms.net/v2/trade/voucher/variable/redemptions';
    const { token, amount } = req.body;
    
    // Convert amount from Rands to cents
    const amountInCents = Math.round(parseFloat(amount) * 100);
    
    console.log('[REDEEM] Token:', token);
    console.log('[REDEEM] Amount (Rands):', amount);
    console.log('[REDEEM] Amount (Cents):', amountInCents);

    const payload = {
      requestId: crypto.randomUUID(),
      token,
      amount: amountInCents
    };

    const headers = {
      accept: 'application/json',
      apikey: '3d177d99-2edd-4249-944b-fec5c820421a',
      'Content-Type': 'application/json',
      'Trade-Vend-Channel': 'API'
    };

    console.log('[REDEEM] Complete request details:');
    console.log('URL:', apiUrl);
    console.log('Method: POST');
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const apiRes = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    console.log('[REDEEM] Response Status:', apiRes.status);

    const text = await apiRes.text();
    console.log('[REDEEM] Raw Response:', text);

    let data;
    try {
      data = JSON.parse(text);
      console.log('[REDEEM] Parsed Response:', data);
      
      // If there's a replacement voucher, simulate SMS sending
      if (data.replacementVoucher) {
        console.log('\n=== SIMULATED SMS MESSAGE ===');
        console.log(`To: ${req.body.mobileNumber || 'Customer'}`);
        console.log('Message:');
        console.log(`Your replacement voucher details:`);
        console.log(`Token: ${data.replacementVoucher.token}`);
        console.log(`Serial Number: ${data.replacementVoucher.serialNumber}`);
        console.log(`Expires: ${new Date(data.replacementVoucher.expiryDateTime).toLocaleDateString()}`);
        console.log('===============================\n');
      }
      
    } catch (parseErr) {
      console.error('[REDEEM] Failed to parse response:', parseErr);
      data = text;
    }

    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error('[REDEEM] Proxy Error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});


