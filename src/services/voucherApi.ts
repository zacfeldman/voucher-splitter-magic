import { ValidateVoucherRequest, ValidateVoucherResponse, SplitVoucherRequest, SplitVoucherResponse } from '@/types/voucher';

const API_BASE_URL = '/api-split/vouchersplitservice/v1';
const ALTERNATIVE_API_URL = '/api/v2/trade/voucher/variable/vouchers';
const TOKEN_BASE_URL = 'https://api.qa.bluelabeltelecoms.co.za';
const TOKEN_URL = '/token';

// Read Client ID and Secret from environment variables
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

const getAuthHeaders = (authToken: string) => {
  return {
    'Authorization': `Bearer ${authToken}`,
  };
};

export const fetchAuthToken = async (): Promise<string> => {
  // Mock token for testing - the actual endpoint is not working
  console.log('Using mock auth token for testing');
  return 'mock_auth_token_for_testing';
};

export const validateVoucher = async (request: ValidateVoucherRequest, authToken: string): Promise<ValidateVoucherResponse> => {
  console.log('Validating voucher with PIN:', request.pin);
  console.log('Using auth token:', authToken);
  
  const headers = {
    ...getAuthHeaders(authToken),
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  console.log('Request headers:', headers);
  
  const response = await fetch('https://api.qa.bluelabeltelecoms.co.za/vouchersplitservice/v1/validatevoucher', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    console.error('Validation failed:', errorData);
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('Voucher validation response:', data);
  return data;
};

export const splitVoucher = async (request: SplitVoucherRequest, authToken: string): Promise<any> => {
  // Convert splitVouchers to use ValueCents (PascalCase) for API compatibility
  const apiRequest = {
    pin: request.pin,
    splitVouchers: request.splitVouchers.map(v => ({ ValueCents: v.ValueCents }))
  };
  const headers = {
    ...getAuthHeaders(authToken),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  console.log('SplitVoucher API request:', apiRequest);
  console.log('SplitVoucher API request payload:', JSON.stringify(apiRequest, null, 2));
  const response = await fetch('https://api.qa.bluelabeltelecoms.co.za/vouchersplitservice/v1/splitvoucher', {
    method: 'POST',
    headers,
    body: JSON.stringify(apiRequest),
  });

  let errorData = null;
  if (!response.ok) {
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: 'Network error' };
    }
    console.error('Split failed:', errorData);
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('Voucher split response:', data);
  return data;
};

export const checkVoucherBalance = async (pin: string): Promise<any> => {
  const url = `/voucher-balance-proxy/v2/trade/voucher/variable/vouchers/full?token=${encodeURIComponent(pin)}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'apikey': '3d177d99-2edd-4249-944b-fec5c820421a',
    },
  });

  if (!response.ok) {
    let errorMsg = `Failed to fetch voucher balance: HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  const data = await response.json();
  return data;
};

export const purchaseVoucher = async ({ amount, requestId, productId = 13, vendMetaData }: {
  amount: number,
  requestId: string,
  productId?: number,
  vendMetaData?: any,
}): Promise<any> => {
  const payload: any = {
    requestId,
    productId,
    amount,
  };
  if (vendMetaData) payload.vendMetaData = vendMetaData;
  const response = await fetch("http://localhost:3001/api/purchase", {
    method: "POST",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    let errorMsg = `Failed to purchase voucher: HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  return response.json();
};

export const redeemAirtime = async ({ requestId, mobileNumber, tokenNumber, amount }: {
  requestId: string,
  mobileNumber: string,
  tokenNumber: string,
  amount: number,
}): Promise<any> => {
  const url = 'http://localhost:3001/api/redeem-airtime';
  const payload = {
    requestId,
    mobileNumber,
    tokenNumber,
    amount,
  };
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };
  console.log('[redeemAirtime] Request URL:', url);
  console.log('[redeemAirtime] Request Headers:', headers);
  console.log('[redeemAirtime] Request Payload:', payload);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  let responseBody;
  try {
    responseBody = await response.clone().json();
  } catch (e) {
    responseBody = await response.clone().text();
  }
  console.log('[redeemAirtime] Response Status:', response.status);
  console.log('[redeemAirtime] Response Body:', responseBody);
  if (!response.ok) {
    let errorMsg = `Failed to redeem airtime: HTTP ${response.status}`;
    if (responseBody && typeof responseBody === 'object' && responseBody.error) {
      errorMsg = responseBody.error;
    }
    throw new Error(errorMsg);
  }
  return responseBody;
};

export const redeemElectricity = async ({ requestId, mobileNumber, meterNumber, tokenNumber, amount }: {
  requestId: string,
  mobileNumber: string,
  meterNumber: string,
  tokenNumber: string,
  amount: number,
}): Promise<any> => {
  const url = 'http://localhost:3001/api/redeem-electricity';
  const payload = {
    requestId,
    mobileNumber,
    meterNumber,
    tokenNumber,
    amount,
  };
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };
  console.log('[redeemElectricity] Request URL:', url);
  console.log('[redeemElectricity] Request Headers:', headers);
  console.log('[redeemElectricity] Request Payload:', payload);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  let responseBody;
  try {
    responseBody = await response.clone().json();
  } catch (e) {
    responseBody = await response.clone().text();
  }
  console.log('[redeemElectricity] Response Status:', response.status);
  console.log('[redeemElectricity] Response Body:', responseBody);
  if (!response.ok) {
    let errorMsg = `Failed to redeem electricity: HTTP ${response.status}`;
    if (responseBody && typeof responseBody === 'object' && responseBody.error) {
      errorMsg = responseBody.error;
    }
    throw new Error(errorMsg);
  }
  return responseBody;
};

export const confirmElectricityMeter = async ({
  amount,
  meterNumber,
  mobileNumber,
  voucherToken,
}: {
  amount: number,
  meterNumber: string,
  mobileNumber: string,
  voucherToken: string,
}) => {
  const params = new URLSearchParams({
    amount: amount.toString(),
    'meter-number': meterNumber,
    'mobile-number': mobileNumber,
    'voucher-token': voucherToken,
  });
  const url = `http://localhost:3001/api/electricity-confirm?${params.toString()}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error('Failed to confirm meter');
  }
  return response.json();
};

export const vendElectricity = async ({
  requestId,
  conversationId,
  reference,
}: {
  requestId: string,
  conversationId: string,
  reference: string,
}) => {
  const url = 'http://localhost:3001/api/electricity-vend';
  const payload = { requestId, conversationId, reference };
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('Failed to vend electricity');
  }
  return response.json();
};

export const redeemBetway = async ({ requestId, accountNumber, tokenNumber, amount }: {
  requestId: string,
  accountNumber: string,
  tokenNumber: string,
  amount: number,
}): Promise<any> => {
  const url = 'http://localhost:3001/api/redeem-betway';
  const payload = {
    requestId,
    accountNumber,
    tokenNumber,
    amount,
  };
  const headers = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };
  console.log('[redeemBetway] Request URL:', url);
  console.log('[redeemBetway] Request Headers:', headers);
  console.log('[redeemBetway] Request Payload:', payload);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  let responseBody;
  try {
    responseBody = await response.clone().json();
  } catch (e) {
    responseBody = await response.clone().text();
  }
  console.log('[redeemBetway] Response Status:', response.status);
  console.log('[redeemBetway] Response Body:', responseBody);
  if (!response.ok) {
    let errorMsg = `Failed to redeem to Betway: HTTP ${response.status}`;
    if (responseBody && typeof responseBody === 'object' && responseBody.error) {
      errorMsg = responseBody.error;
    }
    throw new Error(errorMsg);
  }
  return responseBody;
};
