import { ValidateVoucherRequest, ValidateVoucherResponse, SplitVoucherRequest, SplitVoucherResponse } from '@/types/voucher';

const API_BASE_URL = '/api-split/vouchersplitservice/v1';
const ALTERNATIVE_API_URL = '/api/v2/trade/voucher/variable/vouchers';
const TOKEN_BASE_URL = 'https://api.qa.bluelabeltelecoms.co.za';
const TOKEN_URL = '/api/token';

// Read Client ID and Secret from environment variables
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_CLIENT_SECRET;

const getAuthHeaders = (authToken: string) => {
  return {
    'Authorization': `Bearer ${authToken}`,
  };
};

export const fetchAuthToken = async (): Promise<string> => {
  // Hardcoded credentials are no longer needed in the frontend; the serverless function will handle them.
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
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

export const splitVoucher = async (request: SplitVoucherRequest, authToken: string): Promise<SplitVoucherResponse> => {
  console.log('Splitting voucher:', request);
  
  const headers = {
    ...getAuthHeaders(authToken),
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
  
  const response = await fetch('https://api.qa.bluelabeltelecoms.co.za/vouchersplitservice/v1/splitvoucher', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('Voucher split response:', data);
  return data;
};
