import { apiClient } from '@/lib/api-client';
import type { CreateGoalInput, GoalConstraints } from '@/lib/validations/goal';

export interface Goal {
  id?: string;
  title: string;
  itemCategory: string;
  currentPrice: number;
  targetPrice: number;
  priceHistory: Array<{
    price: number;
    date: string;
  }>;
  source: string;
  url: string;
  imageUrl?: string;
  constraints: GoalConstraints;
  notifications: {
    email: boolean;
    inApp: boolean;
    priceThreshold: number;
  };
  status: 'active' | 'paused' | 'completed' | 'expired';
  createdFrom?: {
    type: 'search';
    searchQuery: string;
    dealId: string;
  };
  isShared?: boolean;
  shareUrl?: string;
  sharedBy?: {
    id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
  deadline?: string;
  matchesFound?: number;
  successRate?: number;
  tokensSpent?: number;
  priority?: 'low' | 'medium' | 'high';
  lastCheckedAt?: string;
  dealsProcessed?: number;
  rewardsEarned?: number;
  bestMatchScore?: number;
  averageMatchScore?: number;
  activeDealsCount?: number;
}

export interface GoalTemplate {
  id: string;
  title: string;
  itemCategory: string;
  constraints: GoalConstraints;
  description: string;
  tokenCost: number;
}

export interface SharedGoalResponse {
  shareUrl: string;
  tokenCost: number;
}

export interface GoalCost {
  tokenCost: number;
  features: string[];
}

class GoalsService {
  async getGoalCost(): Promise<GoalCost> {
    console.log('GoalsService: Fetching goal cost from API');
    try {
      const response = await apiClient.get('/api/v1/goals/cost');
      console.log('GoalsService: Received raw goal cost response:', response);
      
      // Handle different possible response structures
      let costData: GoalCost;
      
      if (response.data && typeof response.data === 'object') {
        console.log('GoalsService: Processing response data:', response.data);
        
        // Case 1: Direct object with tokenCost property
        if (typeof response.data.tokenCost === 'number') {
          console.log('GoalsService: Found tokenCost in root object:', response.data.tokenCost);
          costData = response.data;
        }
        // Case 2: Nested data property with tokenCost
        else if (response.data.data && typeof response.data.data.tokenCost === 'number') {
          console.log('GoalsService: Found tokenCost in nested data object:', response.data.data.tokenCost);
          costData = response.data.data;
        }
        // Case 3: Response with token_cost (snake_case)
        else if (typeof response.data.token_cost === 'number') {
          console.log('GoalsService: Found token_cost (snake_case):', response.data.token_cost);
          costData = {
            tokenCost: response.data.token_cost,
            features: response.data.features || []
          };
        }
        // Case 4: Direct number value
        else if (typeof response.data === 'number') {
          console.log('GoalsService: Response is direct number value:', response.data);
          costData = {
            tokenCost: response.data,
            features: []
          };
        }
        // Fallback
        else {
          console.warn('GoalsService: Could not determine cost format from response:', response.data);
          costData = {
            tokenCost: 5.0, // Default fallback
            features: []
          };
        }
      } else {
        console.warn('GoalsService: Invalid response format:', response.data);
        costData = {
          tokenCost: 5.0, // Default fallback
          features: []
        };
      }
      
      console.log('GoalsService: Final processed goal cost data:', costData);
      return costData;
    } catch (error) {
      console.error('GoalsService: Error fetching goal cost:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('GoalsService: Error response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('GoalsService: No response received from API');
      } else {
        console.error('GoalsService: Error message:', error.message);
      }
      
      // Return default in case of error
      return {
        tokenCost: 5.0, // Default fallback
        features: []
      };
    }
  }

  async createGoal(goal: CreateGoalInput): Promise<Goal> {
    console.log('GoalsService.createGoal called with:', goal);
    
    // Transform the input to match API schema
    const goalData = {
      title: goal.title,
      itemCategory: goal.item_category,
      currentPrice: 0, // Will be set by backend
      targetPrice: goal.constraints.min_price,
      priceHistory: [],
      source: goal.marketplaces[0], // Primary marketplace
      url: '', // Will be set by backend
      constraints: {
        maxPrice: goal.constraints.max_price,
        minPrice: goal.constraints.min_price,
        brands: goal.constraints.brands,
        conditions: goal.constraints.conditions,
        keywords: goal.constraints.keywords,
        features: goal.constraints.features,
      },
      notifications: {
        email: goal.notifications.email,
        inApp: goal.notifications.inApp,
        priceThreshold: goal.notifications.priceThreshold,
      },
      status: 'active',
      priority: goal.priority,
      deadline: goal.deadline,
      max_matches: goal.max_matches, // Using snake_case to match backend expectations
      max_tokens: goal.max_tokens, // Using snake_case to match backend expectations
    };
    
    console.log('GoalsService: Transformed data for API:', goalData);
    console.log('GoalsService: Calling API endpoint:', '/api/v1/goals');

    try {
      const response = await apiClient.post('/api/v1/goals', goalData);
      console.log('GoalsService: API response for goal creation:', response);
      
      try {
        // Try to parse token consumption from response if available
        if (response.data && response.data.tokenConsumption) {
          console.log('GoalsService: Token consumption:', response.data.tokenConsumption);
        }
      } catch (parseError) {
        console.log('GoalsService: No token consumption data found in response');
      }
      
      return response.data;
    } catch (error) {
      console.error('GoalsService: API error in createGoal:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('GoalsService: Error response:', error.response.status, error.response.data);
        
        // Check for token-related errors
        const errorData = error.response.data;
        if (errorData && typeof errorData === 'object') {
          if (errorData.detail && errorData.detail.includes('token')) {
            console.error('GoalsService: Token-related error detected:', errorData.detail);
          }
        }
      } else if (error.request) {
        console.error('GoalsService: No response received from API');
      } else {
        console.error('GoalsService: Error message:', error.message);
      }
      
      throw error;
    }
  }

  async getGoals(): Promise<Goal[]> {
    const response = await apiClient.get('/api/v1/goals');
    return response.data;
  }

  async getGoalById(id: string): Promise<Goal> {
    const response = await apiClient.get(`/api/v1/goals/${id}`);
    return response.data;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    const response = await apiClient.patch(`/api/v1/goals/${id}`, updates);
    return response.data;
  }

  async deleteGoal(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/goals/${id}`);
  }

  async updateGoalStatus(id: string, status: Goal['status']): Promise<Goal> {
    const response = await apiClient.patch(`/api/v1/goals/${id}/status`, { status });
    return response.data;
  }

  async getPriceHistory(id: string): Promise<Goal['priceHistory']> {
    const response = await apiClient.get(`/api/v1/goals/${id}/price-history`);
    return response.data;
  }

  async getGoalTemplates(): Promise<GoalTemplate[]> {
    const response = await apiClient.get('/api/v1/goals/templates');
    return response.data;
  }

  async createGoalFromTemplate(templateId: string): Promise<Goal> {
    const response = await apiClient.post(`/api/v1/goals/templates/${templateId}`);
    return response.data;
  }

  async getGoalAnalytics(id: string): Promise<{
    matchedDeals: number;
    averagePrice: number;
    lowestPrice: number;
    priceDrops: number;
    tokensCost: number;
  }> {
    const response = await apiClient.get(`/api/v1/goals/${id}/analytics`);
    return response.data;
  }

  async shareGoal(id: string): Promise<SharedGoalResponse> {
    const response = await apiClient.post(`/api/v1/goals/${id}/share`);
    return response.data;
  }

  async unshareGoal(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/goals/${id}/share`);
  }

  async getSharedGoal(shareId: string): Promise<Goal> {
    const response = await apiClient.get(`/api/v1/goals/shared/${shareId}`);
    return response.data;
  }

  async cloneSharedGoal(shareId: string): Promise<Goal> {
    const response = await apiClient.post(`/api/v1/goals/shared/${shareId}/clone`);
    return response.data;
  }
}

export const goalsService = new GoalsService(); 