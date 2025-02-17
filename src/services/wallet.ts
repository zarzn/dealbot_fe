import { apiClient } from '@/lib/api-client';
import type { TokenTransaction, WalletInfo, TokenStats, TokenPrice } from '@/types/wallet';

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
    const { data } = await apiClient.get('/api/v1/wallet/balance');
    return data.data;
  }

  async getTransactions(): Promise<TokenTransaction[]> {
    const { data } = await apiClient.get('/api/v1/wallet/transactions');
    return data.data;
  }

  async getWalletInfo(): Promise<WalletInfo> {
    const { data } = await apiClient.get('/api/v1/wallet/info');
    return data.data;
  }

  async connectWallet(address: string): Promise<WalletInfo> {
    const { data } = await apiClient.post('/api/v1/wallet/connect', { address });
    return data.data;
  }

  async disconnectWallet(): Promise<void> {
    await apiClient.post('/api/v1/wallet/disconnect');
  }

  async getTokenStats(): Promise<TokenStats> {
    const { data } = await apiClient.get('/api/v1/wallet/stats');
    return data.data;
  }

  async getTokenPrice(): Promise<TokenPrice> {
    const { data } = await apiClient.get('/api/v1/token/price');
    return data.data;
  }

  async createPurchaseTransaction(request: PurchaseRequest): Promise<PurchaseTransactionResponse> {
    const { data } = await apiClient.post('/api/v1/token/purchase/create', request);
    return data.data;
  }

  async verifyPurchase(signature: string): Promise<void> {
    await apiClient.post('/api/v1/token/purchase/verify', { signature });
  }
}

export const walletService = new WalletService(); 