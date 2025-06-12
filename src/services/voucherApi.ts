
import { ValidateVoucherRequest, ValidateVoucherResponse, SplitVoucherRequest, SplitVoucherResponse } from '@/types/voucher';

const API_BASE_URL = 'https://api.qa.bluelabeltelecoms.co.za/vouchersplitservice/v1';

// Note: For production, these credentials should be stored securely
// For now, we'll handle authentication in the frontend
const getAuthHeaders = () => {
  // In a real application, you would implement proper authentication
  // This is a placeholder for basic auth or OAuth
  return {
    'Content-Type': 'application/json',
    // 'Authorization': 'Basic ' + btoa(username + ':' + password)
  };
};

export const validateVoucher = async (request: ValidateVoucherRequest): Promise<ValidateVoucherResponse> => {
  console.log('Validating voucher with PIN:', request.pin);
  
  const response = await fetch(`${API_BASE_URL}/validatevoucher`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  const data = await response.json();
  console.log('Voucher validation response:', data);
  return data;
};

export const splitVoucher = async (request: SplitVoucherRequest): Promise<SplitVoucherResponse> => {
  console.log('Splitting voucher:', request);
  
  const response = await fetch(`${API_BASE_URL}/splitvoucher`, {
    method: 'POST',
    headers: getAuthHeaders(),
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
