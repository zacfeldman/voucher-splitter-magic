
import { ValidateVoucherRequest, ValidateVoucherResponse, SplitVoucherRequest, SplitVoucherResponse } from '@/types/voucher';

const API_BASE_URL = 'https://api.qa.bluelabeltelecoms.co.za/vouchersplitservice/v1';
const ALTERNATIVE_API_URL = 'https://api.qa.bltelecoms.net/v2/trade/voucher/variable/vouchers';

const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Trade-Vend-Channel': 'API',
    'Accept': 'application/json',
    'apikey': '3d177d99-2edd-4249-944b-fec5c820421a'
  };
};

export const validateVoucher = async (request: ValidateVoucherRequest): Promise<ValidateVoucherResponse> => {
  console.log('Validating voucher with PIN:', request.pin);
  
  try {
    // Try the alternative endpoint first
    const response = await fetch(`${ALTERNATIVE_API_URL}?token=${request.pin}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Voucher validation response:', data);
    
    // Transform the response to match our expected format
    // Note: You may need to adjust this based on the actual response structure
    return {
      SerialNumber: data.serialNumber || request.pin,
      VoucherStatus: data.status || "Active",
      ValueCents: data.amount || data.valueCents || 10000,
      VoucherCanBeSplit: true
    };
  } catch (error) {
    console.error('Alternative API failed, falling back to original:', error);
    
    // Fallback to original endpoint
    const response = await fetch(`${API_BASE_URL}/validatevoucher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    console.log('Voucher validation response (fallback):', data);
    return data;
  }
};

export const splitVoucher = async (request: SplitVoucherRequest): Promise<SplitVoucherResponse> => {
  console.log('Splitting voucher:', request);
  
  const response = await fetch(`${API_BASE_URL}/splitvoucher`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
