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
        const response = await dealsApi.searchDeals(searchParams);
        console.log('useSearchDeals response from API:', response);
        return response;
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
    // Transform the response to extract just the deals array and ensure it's properly formatted
    select: (data) => {
      console.log('useSearchDeals select function data:', data);
      if (!data || !data.deals) {
        console.warn('No deals in API response');
        return [];
      }
      
      // Map the response data to ensure it matches DealSuggestion interface
      return data.deals.map((deal: any) => {
        // Extract AI score if available
        let dealScore;
        if (deal.score !== undefined) {
          dealScore = deal.score;
        } else if (deal.ai_analysis?.score !== undefined) {
          dealScore = deal.ai_analysis.score;
          // Also map it to the score property for compatibility
          deal.score = deal.ai_analysis.score;
        } else if (deal.latest_score !== undefined) {
          dealScore = deal.latest_score;
          deal.score = deal.latest_score;
        } else {
          dealScore = 5; // Default score
          deal.score = 5;
        }
        
        // Use match_score from deal or calculate one if not present
        let matchScore = deal.match_score;
        if (matchScore === undefined) {
          // Calculate based on relevance factors
          let baseScore = dealScore * 10; // Scale AI score to percentage
          
          // Adjust for discount if available
          if (deal.original_price && deal.price) {
            const discount = ((deal.original_price - deal.price) / deal.original_price) * 100;
            if (discount > 20) baseScore += 15;
            else if (discount > 10) baseScore += 10;
            else if (discount > 0) baseScore += 5;
          }
          
          // Adjust for reviews if available
          if (deal.reviews?.average_rating > 4) baseScore += 10;
          else if (deal.reviews?.average_rating > 3) baseScore += 5;
          
          matchScore = Math.min(Math.round(baseScore), 100);
        }
        
        console.log(`Deal ${deal.id} - Score: ${dealScore}, Match: ${matchScore}`);
        
        // Process recommendations
        const recommendations = Array.isArray(deal.recommendations) && deal.recommendations.length > 0
          ? deal.recommendations
          : deal.ai_analysis?.recommendations || [];
          
        // Extract brand information from metadata
        const brand = deal.brand || 
                      deal.deal_metadata?.brand || 
                      (deal.deal_metadata?.specifications && deal.deal_metadata.specifications.brand);
        
        // Make a properly formatted deal object
        return {
          ...deal,
          // Ensure required properties exist
          id: deal.id || `temp-${Math.random().toString(36).substr(2, 9)}`,
          title: deal.title || 'Untitled Deal',
          description: deal.description || '',
          price: typeof deal.price === 'number' ? deal.price : parseFloat(deal.price || '0'),
          original_price: deal.original_price ? parseFloat(String(deal.original_price)) : 0,
          source: deal.source || 'Unknown',
          category: deal.category || 'Uncategorized',
          image_url: deal.image_url || '/placeholder-deal.jpg',
          score: dealScore, // Use extracted score
          match_score: matchScore,
          expires_at: deal.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          url: deal.url || '#',
          is_tracked: !!deal.is_tracked,
          brand,
          recommendations,
          // Ensure nested objects are properly structured
          reviews: deal.reviews || { average_rating: 0, count: 0 },
          shipping_info: deal.shipping_info || { free_shipping: false, estimated_days: 0 },
          availability: deal.availability || { in_stock: true },
          features: deal.features || [],
          seller_info: deal.seller_info || { name: 'Unknown', rating: 0 }
        };
      });
    },
    // Only refetch when search params change
    staleTime: 1000 * 60 * 5, // 5 minutes
    // Force a refetch when this hook is used (temporary fix for testing)
    refetchOnMount: true
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