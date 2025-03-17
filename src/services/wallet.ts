import { apiClient } from '@/lib/api-client';
import type { TokenTransaction, WalletInfo, TokenStats, TokenPrice } from '@/types/wallet';
import { toast } from 'react-hot-toast';

interface PurchaseTransactionResponse {
  transaction: any; // Solana transaction object
  signature: string;
}

interface PurchaseRequest {
  amount: number;
  priceInSOL: number;
}

// Mock data to use when backend fails
const MOCK_BALANCE = 500;
const MOCK_TRANSACTIONS: TokenTransaction[] = [
  {
    id: '1',
    amount: 100,
    type: 'credit',
    description: 'Welcome bonus',
    timestamp: new Date().toISOString(),
    status: 'completed'
  },
  {
    id: '2',
    amount: 50,
    type: 'debit',
    description: 'Used for deal search',
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    status: 'completed'
  }
];

const MOCK_WALLET_INFO: WalletInfo = {
  balance: MOCK_BALANCE,
  address: '',
  isConnected: false,
  network: 'testnet'
};

const MOCK_TOKEN_STATS: TokenStats = {
  totalSpent: 250,
  totalReceived: 750,
  activeGoals: 12,
  lastRefresh: new Date().toISOString()
};

class WalletService {
  async getBalance(): Promise<number> {
    try {
      const { data } = await apiClient.get('/api/v1/token/balance');
      // Ensure we return a number
      return typeof data.data === 'number' ? data.data : parseFloat(data.data) || 0;
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      // If we're in development, log detailed error
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock balance due to error:', error.message);
      }
      // Return mock balance for development
      return MOCK_BALANCE;
    }
  }

  async getTransactions(): Promise<TokenTransaction[]> {
    try {
      const { data } = await apiClient.get('/api/v1/token/transactions');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching token transactions:', error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock transactions due to error:', error.message);
      }
      return MOCK_TRANSACTIONS;
    }
  }

  async getWalletInfo(): Promise<WalletInfo> {
    try {
      const { data } = await apiClient.get('/api/v1/token/info');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching wallet info:', error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock wallet info due to error:', error.message);
      }
      
      // Attempt to get real balance and transactions separately
      let balance = MOCK_BALANCE;
      
      try {
        balance = await this.getBalance();
      } catch (balanceError) {
        console.error('Failed to get fallback balance:', balanceError);
      }
      
      return {
        balance,
        address: '',
        isConnected: false,
        network: 'testnet'
      };
    }
  }

  async connectWallet(address: string): Promise<WalletInfo> {
    try {
      const { data } = await apiClient.post('/api/v1/token/connect-wallet', { address });
      return data.data;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock wallet info for development');
        // In development, simulate success even if backend fails
        return {
          ...MOCK_WALLET_INFO,
          address,
          isConnected: true
        };
      }
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await apiClient.post('/api/v1/token/disconnect-wallet');
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      // In development, ignore errors
      if (process.env.NODE_ENV !== 'development') {
        throw error;
      }
    }
  }

  async getTokenStats(): Promise<TokenStats> {
    try {
      const { data } = await apiClient.get('/api/v1/token/stats');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching token stats:', error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock token stats due to error:', error.message);
      }
      return MOCK_TOKEN_STATS;
    }
  }

  async getTokenPrice(): Promise<TokenPrice> {
    try {
      const { data } = await apiClient.get('/api/v1/token/price');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching token price:', error);
      if (process.env.NODE_ENV === 'development') {
        console.warn('Using mock token price due to error:', error.message);
      }
      return {
        usd: 0.10,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async createPurchaseTransaction(request: PurchaseRequest): Promise<PurchaseTransactionResponse> {
    try {
      const { data } = await apiClient.post('/api/v1/token/purchase/create', request);
      return data.data;
    } catch (error: any) {
      console.error('Error creating purchase transaction:', error);
      throw error;
    }
  }

  async verifyPurchase(signature: string): Promise<void> {
    try {
      await apiClient.post('/api/v1/token/purchase/verify', { signature });
    } catch (error: any) {
      console.error('Error verifying purchase:', error);
      throw error;
    }
  }
}

export const walletService = new WalletService(); 