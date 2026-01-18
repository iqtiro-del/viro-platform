import crypto from 'crypto';

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const NOWPAYMENTS_API_URL = 'https://api.nowpayments.io/v1';

export interface CreateInvoiceParams {
  price_amount: number;
  price_currency: string;
  pay_currency?: string;
  order_id: string;
  order_description?: string;
  ipn_callback_url: string;
  success_url: string;
  cancel_url: string;
}

export interface InvoiceResponse {
  id: string;
  order_id: string;
  order_description: string;
  price_amount: number;
  price_currency: string;
  pay_currency: string | null;
  invoice_url: string;
  success_url: string;
  cancel_url: string;
  created_at: string;
  updated_at: string;
}

export interface IPNPayload {
  payment_id: number;
  payment_status: string;
  pay_address: string;
  price_amount: number;
  price_currency: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
  order_description: string;
  purchase_id: string;
  outcome_amount: number;
  outcome_currency: string;
}

export async function createInvoice(params: CreateInvoiceParams): Promise<InvoiceResponse> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPayments API key not configured');
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}/invoice`, {
    method: 'POST',
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}

export function verifyIPNSignature(payload: any, signature: string): boolean {
  if (!NOWPAYMENTS_IPN_SECRET) {
    console.warn('[NOWPayments] IPN Secret not configured, skipping verification');
    return true;
  }

  try {
    const sortedKeys = Object.keys(payload).sort();
    const sortedPayload: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedPayload[key] = payload[key];
    }
    
    const payloadString = JSON.stringify(sortedPayload);
    const hmac = crypto.createHmac('sha512', NOWPAYMENTS_IPN_SECRET);
    hmac.update(payloadString);
    const calculatedSignature = hmac.digest('hex');
    
    return calculatedSignature === signature;
  } catch (error) {
    console.error('[NOWPayments] IPN verification error:', error);
    return false;
  }
}

export async function getPaymentStatus(paymentId: string): Promise<any> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPayments API key not configured');
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}/payment/${paymentId}`, {
    method: 'GET',
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `NOWPayments API error: ${response.status}`);
  }

  return response.json();
}

export async function getAvailableCurrencies(): Promise<string[]> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPayments API key not configured');
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}/currencies`, {
    method: 'GET',
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch currencies: ${response.status}`);
  }

  const data = await response.json();
  return data.currencies || [];
}

export async function getMinimumPaymentAmount(currency: string): Promise<number> {
  if (!NOWPAYMENTS_API_KEY) {
    throw new Error('NOWPayments API key not configured');
  }

  const response = await fetch(`${NOWPAYMENTS_API_URL}/min-amount?currency_from=${currency}`, {
    method: 'GET',
    headers: {
      'x-api-key': NOWPAYMENTS_API_KEY,
    },
  });

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data.min_amount || 0;
}
