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

class WalletService {
  async getBalance(): Promise<number> {
    try {
      const { data } = await apiClient.get('/api/v1/token/balance');
      // Ensure we return a number
      return typeof data.data === 'number' ? data.data : parseFloat(data.data) || 0;
    } catch (error: any) {
      console.error('Error fetching token balance:', error);
      throw error;
    }
  }

  async getTransactions(): Promise<TokenTransaction[]> {
    try {
      const { data } = await apiClient.get('/api/v1/token/transactions');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching token transactions:', error);
      throw error;
    }
  }

  async getWalletInfo(): Promise<WalletInfo> {
    try {
      const { data } = await apiClient.get('/api/v1/token/info');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching wallet info:', error);
      throw error;
    }
  }

  async connectWallet(address: string): Promise<WalletInfo> {
    try {
      const { data } = await apiClient.post('/api/v1/token/connect-wallet', { address });
      return data.data;
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await apiClient.post('/api/v1/token/disconnect-wallet');
    } catch (error: any) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  async getTokenStats(): Promise<TokenStats> {
    try {
      const { data } = await apiClient.get('/api/v1/token/stats');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching token stats:', error);
      throw error;
    }
  }

  async getTokenPrice(): Promise<TokenPrice> {
    try {
      const { data } = await apiClient.get('/api/v1/token/price');
      return data.data;
    } catch (error: any) {
      console.error('Error fetching token price:', error);
      throw error;
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