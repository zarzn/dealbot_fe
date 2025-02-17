export interface TokenTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
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