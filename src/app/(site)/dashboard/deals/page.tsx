"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { dealsService } from '@/services/deals';
import { walletService } from '@/services/wallet';
import { DealSuggestion } from '@/types/deals';
import DealCard from '@/components/Deals/DealCard';
import TokenCostModal from '@/components/Deals/TokenCostModal';
import toast from 'react-hot-toast';

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deals, setDeals] = useState<DealSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [balance, setBalance] = useState(0);
  const [showCostModal, setShowCostModal] = useState(false);
  const [searchCost, setSearchCost] = useState<{ tokenCost: number; features: string[] } | null>(null);
  const [pendingSearch, setPendingSearch] = useState('');
  
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  useEffect(() => {
    if (debouncedSearch) {
      checkSearchCost(debouncedSearch);
    } else {
      loadDeals({});
    }
  }, [debouncedSearch]);

  const loadWalletBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const checkSearchCost = async (query: string) => {
    try {
      const cost = await dealsService.getSearchCost({ query });
      setSearchCost(cost);
      setPendingSearch(query);
      setShowCostModal(true);
    } catch (error) {
      console.error('Failed to get search cost:', error);
      toast.error('Failed to get search cost');
    }
  };

  const loadDeals = async (params: any) => {
    setLoading(true);
    try {
      const response = await dealsService.searchDeals(params);
      setDeals(response.deals);
      setTotal(response.total);
      // Update balance after successful search
      await loadWalletBalance();
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setShowCostModal(false);
    if (pendingSearch) {
      loadDeals({ query: pendingSearch });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-8">
        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
          />
        </div>

        {/* Filters (placeholder) */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && deals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No deals found</p>
          </div>
        )}
      </div>

      {/* Token Cost Modal */}
      {searchCost && (
        <TokenCostModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          onConfirm={handleSearch}
          cost={searchCost}
          balance={balance}
        />
      )}
    </div>
  );
} 