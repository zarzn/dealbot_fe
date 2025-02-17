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
    const response = await apiClient.get('/api/v1/goals/cost');
    return response.data;
  }

  async createGoal(goal: CreateGoalInput): Promise<Goal> {
    // Transform the input to match API schema
    const goalData = {
      title: goal.title,
      itemCategory: goal.itemCategory,
      currentPrice: 0, // Will be set by backend
      targetPrice: goal.constraints.minPrice,
      priceHistory: [],
      source: goal.marketplaces[0], // Primary marketplace
      url: '', // Will be set by backend
      constraints: {
        maxPrice: goal.constraints.maxPrice,
        minPrice: goal.constraints.minPrice,
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
      maxMatches: goal.maxMatches,
      maxTokens: goal.maxTokens,
    };

    const response = await apiClient.post('/api/v1/goals', goalData);
    return response.data;
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