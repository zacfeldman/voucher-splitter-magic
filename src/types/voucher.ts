export interface ValidateVoucherRequest {
  pin: string;
}

export interface ValidateVoucherResponse {
  SerialNumber: string;
  VoucherStatus: string;
  ValueCents: number;
  VoucherCanBeSplit: boolean;
}

export interface DesiredVoucher {
  ValueCents: number;
}

export interface SplitVoucherRequest {
  pin: string;
  splitVouchers: DesiredVoucher[];
}

export interface VariableVoucherVendJsonResponse {
  requestId: string;
  reference: string;
  amount: number;
  dateTime: string;
  token: string;
  serialNumber: string;
  expiryDateTime: string;
  barcode?: string;
  productName: string;
  productInstructions: string;
  productHelp: string;
  customerMessage: string;
}

export interface SplitVoucherResponse {
  SplitVouchers: VariableVoucherVendJsonResponse[];
  message?: string;
}

export interface ErrorResponse {
  errorCode: string;
  error: string;
}

export interface RedeemVoucherRequest {
  token: string;
  amount: number;
  cellphoneNumber: string;
}
