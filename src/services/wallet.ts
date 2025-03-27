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
    console.log('WalletService: Fetching user balance');
    try {
      const { data } = await apiClient.get('/api/v1/token/balance');
      console.log('WalletService: Received balance data:', data);
      
      // Validate balance data format
      if (data && typeof data.balance === 'number') {
        console.log('WalletService: Valid balance returned:', data.balance);
        return data.balance;
      } else {
        console.error('WalletService: Invalid balance format received:', data);
        return 0; // Default to 0 for safety
      }
    } catch (error) {
      console.error('WalletService: Error fetching balance:', error);
      // Enhanced error logging
      if (error.response) {
        console.error('WalletService: Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('WalletService: No response received from API');
      } else {
        console.error('WalletService: Error message:', error.message);
      }
      throw error;
    }
  }

  async getTransactions(): Promise<TokenTransaction[]> {
    try {
      const { data } = await apiClient.get('/api/v1/token/transaction-history');
      
      // Transform backend transactions to match frontend interface
      const transactions = data.transactions.map(tx => ({
        id: tx.id,
        type: tx.type as any, // Cast to expected type
        amount: tx.amount,
        // Extract description from details object or use a default based on transaction type
        description: tx.details?.description || this.getDefaultDescription(tx.type),
        timestamp: tx.created_at,
        status: tx.status,
        txHash: tx.signature, // Backend uses 'signature' instead of 'txHash'
        metadata: tx.details || {}
      }));
      
      return transactions;
    } catch (error: any) {
      console.error('Error fetching token transactions:', error);
      throw error;
    }
  }

  // Helper method to generate default descriptions for transaction types
  private getDefaultDescription(type: string): string {
    const typeMap: Record<string, string> = {
      'credit': 'Token Credit',
      'debit': 'Token Debit',
      'reward': 'Reward Tokens',
      'refund': 'Token Refund',
      'deduction': 'Token Deduction',
      'payment': 'Token Payment',
      'search_payment': 'Search Payment',
      'search_refund': 'Search Refund',
      'outgoing': 'Tokens Sent',
      'incoming': 'Tokens Received',
      'mint': 'Tokens Minted',
      'burn': 'Tokens Burned',
      'transfer_in': 'Transfer Received',
      'transfer_out': 'Transfer Sent'
    };
    
    return typeMap[type] || `Token Transaction (${type})`;
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