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
  // Hardcoded credentials for debugging (updated client_id)
  const credentials = btoa('gbY4W8HgfoKLPPj_itX7oqY8XlIa:jB34ClQIza3ZkxfSbUkic8hVDgsa');
  console.log('Auth header:', `Basic ${credentials}`);
  const response = await fetch('/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
      'Authorization': `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      'grant_type': 'client_credentials',
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch auth token: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
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
