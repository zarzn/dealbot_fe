import { apiClient } from '@/lib/api-client';
import type { 
  TokenTransaction, 
  WalletInfo, 
  TokenStats, 
  TokenPrice, 
  TokenPurchaseRequest, 
  TokenPurchaseCreateResponse, 
  TokenPurchaseVerifyResponse, 
  StripePaymentResponse 
} from '@/types/wallet';
import { toast } from 'react-hot-toast';
import { useUserStore } from '@/stores/userStore';

// Track if there's an in-progress balance refresh to avoid duplicate calls
let isRefreshingBalance = false;

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

  /**
   * Refreshes the user's token balance and updates the user store
   * This is useful after token-consuming operations
   * @returns {Promise<number>} The updated balance
   */
  async refreshBalanceAndUpdateStore(): Promise<number> {
    // Prevent multiple simultaneous refresh calls
    if (isRefreshingBalance) {
      console.log('WalletService: Balance refresh already in progress, skipping');
      return -1;
    }

    try {
      isRefreshingBalance = true;
      console.log('WalletService: Refreshing token balance and updating store');
      
      const latestBalance = await this.getBalance();
      
      // Get the userStore and update the balance
      const userStore = useUserStore.getState();
      userStore.setTokenBalance(latestBalance);
      
      console.log(`WalletService: Updated token balance in store: ${latestBalance}`);
      
      // Dispatch a custom event to notify components about the balance update
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('token-balance-updated', { 
          detail: { balance: latestBalance, timestamp: Date.now() }
        });
        window.dispatchEvent(event);
        console.log('WalletService: Dispatched token-balance-updated event');
      }
      
      return latestBalance;
    } catch (error) {
      console.error('WalletService: Failed to refresh balance:', error);
      throw error;
    } finally {
      isRefreshingBalance = false;
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
      console.log('WalletService: Received wallet info:', data);
      
      // Check if the response contains expected structure
      if (!data || !data.address) {
        console.warn('WalletService: Wallet info has invalid format, returning default values');
        return {
          address: '',
          balance: 0,
          isConnected: false,
          network: 'mainnet-beta'
        };
      }
      
      return {
        address: data.address || '',
        balance: typeof data.balance === 'number' ? data.balance : 0,
        isConnected: !!data.isConnected,
        network: data.network || 'mainnet-beta'
      };
    } catch (error: any) {
      console.error('Error fetching wallet info:', error);
      // Return default wallet info instead of throwing
      return {
        address: '',
        balance: 0,
        isConnected: false,
        network: 'mainnet-beta'
      };
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
      const response = await apiClient.get('/api/v1/token/stats');
      
      if (!response || !response.data) {
        console.error('Invalid response from token stats API:', response);
        throw new Error('Invalid response from server');
      }
      
      // Return response.data directly, not response.data.data
      return response.data;
    } catch (error: any) {
      console.error('Error fetching token stats:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch token stats');
    }
  }

  async getTokenPrice(): Promise<number> {
    try {
      const response = await apiClient.get<{ price: number }>('/api/v1/token/price');
      return response.data.price;
    } catch (error: any) {
      console.error('Error fetching token price:', error);
        
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch token price');
    }
  }

  async createPurchaseTransaction(request: TokenPurchaseRequest): Promise<TokenPurchaseCreateResponse> {
    try {
      console.log('Creating purchase transaction with request:', request);
      
      // Set phantom as default payment method if not specified
      const updatedRequest = {
        ...request,
        payment_method: request.payment_method || 'phantom'
      };
      
      const response = await apiClient.post<TokenPurchaseCreateResponse>('/api/v1/token/purchase/create', updatedRequest);
      
      // Enhanced error checking and logging
      if (!response || !response.data) {
        console.error('Invalid response from purchase transaction API:', response);
        throw new Error('Invalid response from server');
      }
      
      console.log('Received purchase transaction response:', response.data);
      
      // We no longer need to transform the transaction since we're using Phantom's direct transfer
      // Just return the data as is from the backend
      return response.data;
    } catch (error: any) {
      console.error('Error creating purchase transaction:', error);
      
      // Enhanced error details for debugging
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create purchase transaction');
    }
  }

  async createStripePayment(request: TokenPurchaseRequest): Promise<StripePaymentResponse> {
    try {
      console.log('Creating Stripe payment with request:', request);
      
      // Ensure we're using Stripe payment method
      const updatedRequest = {
        ...request,
        payment_method: 'stripe'
      };
      
      const response = await apiClient.post<StripePaymentResponse>('/api/v1/token/purchase/stripe/create', updatedRequest);
      
      if (!response || !response.data) {
        console.error('Invalid response from Stripe payment API:', response);
        throw new Error('Invalid response from server');
      }
      
      console.log('Received Stripe payment response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error creating Stripe payment:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to create Stripe payment');
    }
  }
  
  async verifyStripePayment(paymentIntentId: string): Promise<TokenPurchaseVerifyResponse> {
    try {
      console.log('Verifying Stripe payment:', paymentIntentId);
      
      const response = await apiClient.post<TokenPurchaseVerifyResponse>('/api/v1/token/purchase/stripe/verify', {
        payment_intent_id: paymentIntentId
      });
      
      if (!response || !response.data) {
        console.error('Invalid response from Stripe verify API:', response);
        throw new Error('Invalid response from server');
      }
      
      console.log('Received Stripe verification response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error verifying Stripe payment:', error);
      
      if (error.response) {
        console.error('Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('No response received:', error.request);
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to verify Stripe payment');
    }
  }

  async verifyPurchase(signature: string): Promise<TokenPurchaseVerifyResponse> {
    try {
      // Validate the signature format
      if (!signature || typeof signature !== 'string') {
        throw new Error('Invalid signature format');
      }
      
      console.log('Verifying purchase transaction with signature:', signature);
      
      // IMPORTANT: The signature here is NOT the actual Solana blockchain signature
      // It's a placeholder/identifier generated by the backend during the create purchase call
      // In a production environment, we would send both:
      // 1. The backend signature to identify the transaction in the backend's system
      // 2. The actual blockchain transaction signature for on-chain verification
      const response = await apiClient.post<TokenPurchaseVerifyResponse>('/api/v1/token/purchase/verify', { signature });
      console.log('Verify purchase response:', response.data);
      
      if (!response.data.success) {
        throw new Error('Transaction verification failed');
      }
      
      // Update balance after successful verification
      await this.refreshBalanceAndUpdateStore();
      
      return response.data;
    } catch (error: any) {
      console.error('Error verifying purchase:', error);
      
      // Enhanced error details for debugging
      if (error.response) {
        console.error('Error response details:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      
      throw new Error(error.response?.data?.detail || error.message || 'Failed to verify purchase transaction');
    }
  }
}

export const walletService = new WalletService(); 