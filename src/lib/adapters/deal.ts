/**
 * Adapters for converting deal data between different formats
 */

import { Deal, DealResponse, ShippingInfo } from '@/types/deal';

/**
 * Convert a DealResponse from the API to the Deal format needed by UI components
 */
export function adaptDealToDealCard(dealResponse: DealResponse): Deal {
  // Create a standardized shipping_info object
  const shippingInfo: ShippingInfo = {
    price: dealResponse.shipping_info?.price || 0,
    is_free: dealResponse.shipping_info?.is_free || false,
    estimated_delivery: dealResponse.shipping_info?.estimated_delivery || '',
    provider: dealResponse.shipping_info?.provider || '',
  };

  // Extract features from tags if available
  const features = dealResponse.tags ? 
    dealResponse.tags.filter(tag => !tag.includes(':') && tag.length > 2) : 
    [];

  return {
    id: dealResponse.id,
    title: dealResponse.title,
    description: dealResponse.description || '',
    price: dealResponse.price,
    original_price: dealResponse.original_price,
    currency: dealResponse.currency || 'USD',
    url: dealResponse.url || '',
    image_url: dealResponse.image_url || '',
    created_at: dealResponse.created_at,
    updated_at: dealResponse.updated_at,
    source: dealResponse.source,
    market_type: dealResponse.market_type,
    market_name: dealResponse.market_name,
    category: dealResponse.category,
    tags: dealResponse.tags,
    rating: dealResponse.rating,
    review_count: dealResponse.review_count,
    metadata: dealResponse.metadata,
    
    // Additional Deal specific fields
    is_favorite: dealResponse.is_favorite || false,
    score: dealResponse.ai_analysis?.analysis?.score || 0,
    features: features,
    ai_analysis: dealResponse.ai_analysis,
    market_id: dealResponse.market_id,
    goal_id: dealResponse.goal_id,
    user_id: dealResponse.user_id,
    shipping_info: shippingInfo,
    seller_info: dealResponse.seller_info,
    price_history: dealResponse.price_history,
    is_tracked: dealResponse.is_tracked || false,
    is_in_stock: dealResponse.is_in_stock || true,
    expires_at: dealResponse.expires_at,
    deal_score: dealResponse.deal_score,
    deal_url: dealResponse.deal_url,
    deal_type: dealResponse.deal_type,
  };
}

/**
 * Extract structured features from a product description
 */
export function extractFeaturesFromDescription(description: string): string[] {
  if (!description) return [];
  
  // Split by common feature delimiters
  const lines = description.split(/[•\n\r-]+/).filter(Boolean);
  
  // Filter out very short lines and common phrases
  return lines
    .map(line => line.trim())
    .filter(line => 
      line.length > 10 && 
      line.length < 100 &&
      !line.toLowerCase().includes('warranty') &&
      !line.toLowerCase().includes('disclaimer') &&
      !line.toLowerCase().includes('please note')
    )
    .slice(0, 8); // Limit to 8 features max
}

/**
 * Calculate the value score of a deal based on various factors
 */
export function calculateDealValueScore(deal: DealResponse): number {
  let score = 0;
  
  // Price factor: If there's a discount
  if (deal.original_price && deal.original_price > deal.price) {
    const discountPercentage = (deal.original_price - deal.price) / deal.original_price;
    score += discountPercentage * 40; // Up to 40 points for discount
  }
  
  // Rating factor: If the product has good ratings
  if (deal.rating) {
    score += (deal.rating / 5) * 30; // Up to 30 points for perfect rating
  }
  
  // Review count factor: More reviews = more reliable
  if (deal.review_count) {
    const reviewScore = Math.min(deal.review_count / 100, 1) * 15;
    score += reviewScore; // Up to 15 points for 100+ reviews
  }
  
  // AI Analysis factor
  if (deal.ai_analysis?.analysis?.score) {
    score += deal.ai_analysis.analysis.score * 15; // Up to 15 points from AI analysis
  }
  
  return Math.min(Math.round(score), 100) / 100; // Return normalized score 0-1
} 