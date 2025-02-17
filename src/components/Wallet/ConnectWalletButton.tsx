import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { walletService } from '@/services/wallet';

interface ConnectWalletButtonProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export default function ConnectWalletButton({
  isConnected,
  onConnectionChange,
}: ConnectWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Check if Phantom wallet is installed
      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        window.open('https://phantom.app/', '_blank');
        return;
      }

      // Request wallet connection
      const response = await provider.connect();
      const address = response.publicKey.toString();

      // Connect wallet in our backend
      await walletService.connectWallet(address);
      onConnectionChange(true);
      toast.success('Wallet connected successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
      onConnectionChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await walletService.disconnectWallet();
      onConnectionChange(false);
      toast.success('Wallet disconnected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg transition ${
        isConnected
          ? 'bg-purple/20 text-purple hover:bg-purple/30'
          : 'bg-purple text-white hover:bg-purple/80'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading
        ? 'Loading...'
        : isConnected
        ? 'Disconnect Wallet'
        : 'Connect Wallet'}
    </button>
  );
} 