"use client";

import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, History, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { walletService } from '@/services/wallet';
import type { TokenTransaction } from '@/types/wallet';
import TokenUsageChart from '@/components/Wallet/TokenUsageChart';
import ConnectWalletButton from '@/components/Wallet/ConnectWalletButton';
import PurchaseTokensModal from '@/components/Wallet/PurchaseTokensModal';
import Link from 'next/link';

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceData, transactionsData] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ]);
      setBalance(balanceData);
      setTransactions(transactionsData);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch wallet data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWalletConnection = (connected: boolean) => {
    setIsWalletConnected(connected);
    if (connected) {
      fetchWalletData();
    }
  };

  const handlePurchaseSuccess = () => {
    fetchWalletData();
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-8 w-48 bg-white/10 rounded" />
        <div className="h-32 w-full bg-white/10 rounded-lg" />
        <div className="space-y-4">
          <div className="h-6 w-3/4 bg-white/10 rounded" />
          <div className="h-4 w-1/2 bg-white/10 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-white/70">Manage your tokens and track usage</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Balance & Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Balance Card */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                <h2 className="text-lg font-semibold">Token Balance</h2>
              </div>
              <ConnectWalletButton
                isConnected={isWalletConnected}
                onConnectionChange={handleWalletConnection}
              />
            </div>
            <div className="text-3xl font-bold mb-2">{balance.toFixed(2)} AIDL</div>
            <p className="text-white/70">≈ ${(balance * 0.1).toFixed(2)} USD</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => setIsPurchaseModalOpen(true)}
              className="p-4 bg-white/[0.05] rounded-xl hover:bg-white/[0.1] transition flex items-center gap-3"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Plus className="w-5 h-5 text-blue" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Add Tokens</div>
                <div className="text-sm text-white/70">Purchase more tokens</div>
              </div>
            </button>
            <Link
              href="/dashboard/wallet/transactions"
              className="p-4 bg-white/[0.05] rounded-xl hover:bg-white/[0.1] transition flex items-center gap-3"
            >
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <History className="w-5 h-5 text-blue" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-semibold">Transaction History</div>
                <div className="text-sm text-white/70">View all transactions</div>
              </div>
            </Link>
          </div>

          {/* Token Usage Chart */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h2 className="text-lg font-semibold mb-4">Token Usage</h2>
            <div className="h-[300px]">
              <TokenUsageChart data={transactions} />
            </div>
          </div>
        </div>

        {/* Right Column - Recent Transactions */}
        <div className="space-y-6">
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.length === 0 ? (
                <p className="text-white/70 text-center py-4">No transactions yet</p>
              ) : (
                transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-lg"
                  >
                    <div className={`p-2 rounded-lg ${
                      tx.type === 'credit'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{tx.description}</div>
                      <div className="text-sm text-white/70">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`text-right ${
                      tx.type === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {tx.type === 'credit' ? '+' : '-'}{tx.amount.toFixed(2)} AIDL
                    </div>
                  </div>
                ))
              )}
            </div>
            {transactions.length > 5 && (
              <button className="w-full mt-4 px-4 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition text-sm">
                View All Transactions
              </button>
            )}
          </div>

          {/* Token Stats */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h2 className="text-lg font-semibold mb-4">Token Statistics</h2>
            <div className="space-y-4">
              <div>
                <div className="text-white/70 text-sm">Total Spent</div>
                <div className="text-lg font-medium">
                  {transactions
                    .filter(tx => tx.type === 'debit')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toFixed(2)} AIDL
                </div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Total Received</div>
                <div className="text-lg font-medium">
                  {transactions
                    .filter(tx => tx.type === 'credit')
                    .reduce((sum, tx) => sum + tx.amount, 0)
                    .toFixed(2)} AIDL
                </div>
              </div>
              <div>
                <div className="text-white/70 text-sm">Active Goals</div>
                <div className="text-lg font-medium">12</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <PurchaseTokensModal
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  );
} 