"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Filter, SlidersHorizontal, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { walletService } from '@/services/wallet';
import type { TokenTransaction } from '@/types/wallet';
import { formatDistanceToNow } from '@/lib/date-utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

type FilterOption = 'all' | 'credit' | 'debit';
type SortOption = 'newest' | 'oldest' | 'amount-high' | 'amount-low';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use the wallet service to fetch real transaction data
      const data = await walletService.getTransactions();
      // Ensure we always have an array of transactions
      setTransactions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setError('Unable to load transactions. Please try again later.');
      setTransactions([]);
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure transactions is always an array
  const safeTransactions = transactions || [];

  const filteredTransactions = safeTransactions
    .filter(transaction => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus !== transaction.type) return false;
      }
      
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          transaction.description.toLowerCase().includes(query) ||
          transaction.amount.toString().includes(query)
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'oldest':
          return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        case 'amount-high':
          return b.amount - a.amount;
        case 'amount-low':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/wallet"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Transaction History</h1>
          <p className="text-white/70">View and track your token transactions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
          />
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Type</DropdownMenuLabel>
            {[
              { value: 'all', label: 'All' },
              { value: 'credit', label: 'Credits' },
              { value: 'debit', label: 'Debits' },
            ].map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setFilterStatus(value as FilterOption)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {filterStatus === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger className="px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg flex items-center gap-2 hover:bg-white/[0.1] transition">
            <SlidersHorizontal className="w-5 h-5" />
            <span>Sort</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'amount-high', label: 'Amount: High to Low' },
              { value: 'amount-low', label: 'Amount: Low to High' },
            ].map(({ value, label }) => (
              <DropdownMenuItem
                key={value}
                onClick={() => setSortBy(value as SortOption)}
                className="flex items-center justify-between"
              >
                <span>{label}</span>
                {sortBy === value && <Check className="w-4 h-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading state
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="bg-white/[0.05] rounded-lg p-4 animate-pulse"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-white/10 rounded" />
                </div>
              </div>
            </div>
          ))
        ) : filteredTransactions.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/[0.05] flex items-center justify-center">
              <ArrowUpRight className="w-8 h-8 text-white/30" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
            <p className="text-white/50">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Your transaction history will appear here'}
            </p>
          </div>
        ) : (
          // Transactions list
          filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition"
            >
              <div className={`p-2 rounded-lg ${
                transaction.type === 'credit'
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {transaction.type === 'credit' ? (
                  <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-white/50">
                      {formatDistanceToNow(transaction.timestamp)}
                    </p>
                  </div>
                  <div className={`text-right ${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    <p className="font-medium">
                      {transaction.type === 'credit' ? '+' : '-'}{transaction.amount.toFixed(2)} AIDL
                    </p>
                    <p className="text-sm text-white/50">
                      {transaction.status}
                    </p>
                  </div>
                </div>
                {transaction.txHash && (
                  <div className="mt-2 text-sm">
                    <span className="text-white/50">TX: </span>
                    <a
                      href={`https://solscan.io/tx/${transaction.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple hover:underline"
                    >
                      {transaction.txHash}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
} 
 