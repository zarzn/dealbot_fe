import { walletService } from '@/services/wallet';

/**
 * Hook for accessing the wallet service
 * @returns The wallet service instance
 */
export function useWalletService() {
  return walletService;
} 