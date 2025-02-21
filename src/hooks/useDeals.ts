import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DealSearch, DealResponse, AIAnalysis, PriceHistory } from '@/types/deals';
import * as dealsApi from '@/api/deals';
import { toast } from '@/components/ui/use-toast';

export const useSearchDeals = (searchParams: DealSearch) => {
  return useQuery({
    queryKey: ['deals', 'search', searchParams],
    queryFn: () => dealsApi.searchDeals(searchParams),
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