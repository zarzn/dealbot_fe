export interface TokenTransaction {
  id: string;
  type: 'credit' | 'debit' | 'reward' | 'refund' | 'deduction' | 'payment' | 'search_payment' | 'search_refund' | 'outgoing' | 'incoming';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  txHash?: string;
  metadata?: Record<string, any>;
}

export interface WalletInfo {
  address: string;
  balance: number;
  isConnected: boolean;
  network: string;
}

export interface TokenStats {
  totalSpent: number;
  totalReceived: number;
  activeGoals: number;
  lastRefresh: string;
}

export interface TokenPrice {
  usd: number;
  lastUpdated: string;
}

// Payment method type
export type PaymentMethod = 'phantom' | 'stripe';

// Extended TokenPurchaseRequest with payment method
export interface TokenPurchaseRequest {
  amount: number;
  priceInSOL: number;
  network?: string;
  payment_method?: PaymentMethod;
  memo?: string;
  metadata?: Record<string, any>;
}

// Response from purchase/create endpoint
export interface TokenPurchaseCreateResponse {
  transaction: any; // Solana transaction object
  signature: string;
}

// Response from purchase/verify endpoint
export interface TokenPurchaseVerifyResponse {
  success: boolean;
  transaction_id: string;
  amount: number;
  new_balance: number;
}

// Stripe-specific interfaces
export interface StripePaymentRequest {
  amount: number;
  currency?: string;
  payment_method_types?: string[];
  metadata?: Record<string, any>;
}

export interface StripePaymentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface StripePaymentVerifyRequest {
  payment_intent_id: string;
} 