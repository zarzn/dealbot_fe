import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DealSearch, DealResponse, AIAnalysis, PriceHistory, DealSuggestion } from '@/types/deals';
import * as dealsApi from '@/api/deals';
import { toast } from '@/components/ui/use-toast';
import { SearchResponse } from '@/services/deals';

export const useSearchDeals = (searchParams: DealSearch) => {
  return useQuery<SearchResponse, Error, DealSuggestion[]>({
    queryKey: ['deals', 'search', searchParams],
    queryFn: async () => {
      try {
        return await dealsApi.searchDeals(searchParams);
      } catch (error) {
        console.error('Error searching deals:', error);
        toast({
          title: 'Error searching deals',
          description: error instanceof Error ? error.message : 'Unknown error',
          variant: 'destructive',
        });
        throw error;
      }
    },
    // Transform the response to extract just the deals array
    select: (data) => data.deals,
    // Only refetch when search params change
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useDeal = (dealId: string) => {
  return useQuery({
    queryKey: ['deals', dealId],
    queryFn: () => dealsApi.getDeal(dealId),
    enabled: !!dealId,
  });
};

export const useDealAnalysis = (dealId: string) => {
  return useQuery({
    queryKey: ['deals', dealId, 'analysis'],
    queryFn: () => dealsApi.getDealAnalysis(dealId),
    enabled: !!dealId,
  });
};

export const usePriceHistory = (dealId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['deals', dealId, 'price-history', days],
    queryFn: () => dealsApi.getPriceHistory(dealId, days),
    enabled: !!dealId,
  });
};

export const useTrackDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealsApi.trackDeal,
    onSuccess: (_, dealId) => {
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
      toast({
        title: 'Deal tracked',
        description: 'You will be notified of any updates.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error tracking deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUntrackDeal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: dealsApi.untrackDeal,
    onSuccess: (_, dealId) => {
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
      toast({
        title: 'Deal untracked',
        description: 'You will no longer receive updates for this deal.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error untracking deal',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}; 