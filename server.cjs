const express = require('express');
const fetch = require('node-fetch').default;
const cors = require('cors');

const app = express();
const PORT = 3001;

// Allow CORS for local dev
app.use(cors());
app.use(express.json());

app.post('/api/redeem-airtime', async (req, res) => {
  const { requestId, mobileNumber, tokenNumber, amount } = req.body;

  // Validate input
  if (!requestId || !mobileNumber || !tokenNumber || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.qa.bltelecoms.net/v2/trade/voucher/variable/vouchers/airtime/redemption', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'apikey': 'bd1700ad-d845-4c31-99ca-fda9ff168f85',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, mobileNumber, tokenNumber, amount }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.post('/api/purchase', async (req, res) => {
  const { requestId, productId, amount, vendMetaData } = req.body;
  if (!requestId || !productId || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  try {
    const response = await fetch('https://api.qa.bltelecoms.net/v2/trade/voucher/variable/sales', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'apikey': 'bd1700ad-d845-4c31-99ca-fda9ff168f85',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requestId, productId, amount, vendMetaData }),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
}); 