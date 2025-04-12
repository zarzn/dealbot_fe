import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { walletService } from '@/services/wallet';
import { Loader2 } from 'lucide-react';

interface ConnectWalletButtonProps {
  isConnected: boolean;
  onConnectionChange: (connected: boolean) => void;
}

export default function ConnectWalletButton({
  isConnected,
  onConnectionChange,
}: ConnectWalletButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if Phantom wallet is installed
  const isPhantomInstalled = () => {
    const provider = (window as any).solana;
    return !!provider?.isPhantom;
  };

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      // Check if Phantom wallet is installed
      const provider = (window as any).solana;
      if (!provider?.isPhantom) {
        toast.error('Phantom wallet is not installed', {
          id: 'phantom-missing',
          duration: 5000,
        });
        
        // Open Phantom website in a new tab
        window.open('https://phantom.app/', '_blank');
        setIsLoading(false);
        return;
      }

      // Request wallet connection
      try {
        const response = await provider.connect();
        if (!response || !response.publicKey) {
          toast.error('Failed to connect wallet: No public key received');
          setIsLoading(false);
          return;
        }
        
        const address = response.publicKey.toString();
        if (!address) {
          toast.error('Failed to get wallet address');
          setIsLoading(false);
          return;
        }

        // Connect wallet in our backend
        await walletService.connectWallet(address);
        onConnectionChange(true);
        toast.success('Wallet connected successfully');
      } catch (phantomError: any) {
        // Handle user rejection or connection errors
        console.error('Phantom connection error:', phantomError);
        toast.error(phantomError.message || 'User rejected wallet connection');
        onConnectionChange(false);
      }
    } catch (error: any) {
      console.error('Wallet connection error:', error);
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
      
      // Also disconnect from Phantom wallet if available
      try {
        const provider = (window as any).solana;
        if (provider?.isPhantom && provider.disconnect) {
          await provider.disconnect();
        }
      } catch (phantomError) {
        console.error('Error disconnecting from Phantom:', phantomError);
        // Continue anyway since we've disconnected on the backend
      }
      
      onConnectionChange(false);
      toast.success('Wallet disconnected');
    } catch (error: any) {
      console.error('Wallet disconnection error:', error);
      toast.error(error.message || 'Failed to disconnect wallet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={isConnected ? handleDisconnect : handleConnect}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg transition flex items-center justify-center space-x-2 ${
        isConnected
          ? 'bg-purple/20 text-purple hover:bg-purple/30'
          : 'bg-purple text-white hover:bg-purple/80'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
      <span>
        {isLoading
          ? 'Processing...'
          : isConnected
          ? 'Disconnect Wallet'
          : 'Connect Wallet'}
      </span>
      {!isConnected && !isPhantomInstalled() && (
        <span className="text-xs ml-1">(Install Phantom)</span>
      )}
    </button>
  );
} 