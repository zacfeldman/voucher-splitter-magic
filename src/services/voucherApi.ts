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
  // Mock response for UI development while backend is down
  return {
    originalVoucher: {
      serialNumber: 'BL01CCBE9EAAE6A5',
      amount: 50000,
      status: 'SPLIT',
      voucherType: 'BluVoucher',
      saleDateTime: '2021-06-22T14:07:41+02:00',
      entityName: 'Engin Garage',
    },
    splitVouchers: [
      {
        token: '3715617184665132',
        amount: 25000,
        status: 'ACTIVE',
        expiryDateTime: '2022-01-09T14:07:41+02:00',
        serialNumber: 'BL01CCBE9EAAE6A6',
        voucherType: 'BluVoucher',
        saleDateTime: '2021-06-22T14:07:41+02:00',
        entityName: 'Engin Garage',
      },
      {
        token: '3715617184665133',
        amount: 25000,
        status: 'ACTIVE',
        expiryDateTime: '2022-01-09T14:07:41+02:00',
        serialNumber: 'BL01CCBE9EAAE6A7',
        voucherType: 'BluVoucher',
        saleDateTime: '2021-06-22T14:07:41+02:00',
        entityName: 'Engin Garage',
      }
    ]
  };
};

export const checkVoucherBalance = async (pin: string): Promise<any> => {
  // Mock response for UI development while backend is down
  return {
    status: 'PENDING',
    amount: 50000,
    expiryDateTime: '2022-01-09T14:07:41+02:00',
    redemptionDateTime: '2019-01-09T14:07:41+02:00',
    redemptionRequestId: '0123456789',
    redemptionPartner: 'Betway Blu Voucher Redemption',
    voucherTypeId: 13,
    msisdn: '0728703170',
    serialNumber: 'BL01CCBE9EAAE6A5',
    voucherType: 'BluVoucher',
    saleDateTime: '2021-06-22T14:07:41+02:00',
    paymentType: 'Cash',
    entityName: 'Engin Garage',
    token: pin
  };
};
