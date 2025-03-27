import { apiClient } from '@/lib/api-client';

export interface DashboardMetrics {
  deals: {
    total: number;
    active: number;
    completed: number;
    saved: number;
    successRate: number;
    averageDiscount: number;
    totalSavings: number;
  };
  goals: {
    total: number;
    active: number;
    completed: number;
    expired: number;
    averageSuccess: number;
    matchRate: number;
  };
  tokens: {
    balance: number;
    spent: {
      total: number;
      deals: number;
      goals: number;
      other: number;
    };
    earned: {
      total: number;
      referrals: number;
      achievements: number;
      other: number;
    };
    history: Array<{
      date: string;
      amount: number;
      type: 'spent' | 'earned';
      category: string;
    }>;
  };
  activity: Array<{
    id: string;
    type: 'deal' | 'goal' | 'token' | 'system';
    action: string;
    details: Record<string, any>;
    timestamp: string;
  }>;
}

export interface PerformanceMetrics {
  daily: Array<{
    date: string;
    deals: number;
    goals: number;
    tokens: number;
  }>;
  weekly: Array<{
    week: string;
    deals: number;
    goals: number;
    tokens: number;
  }>;
  monthly: Array<{
    month: string;
    deals: number;
    goals: number;
    tokens: number;
  }>;
}

class AnalyticsService {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await apiClient.get('/api/v1/analytics/dashboard');
    return response.data;
  }

  async getPerformanceMetrics(timeframe: 'daily' | 'weekly' | 'monthly'): Promise<PerformanceMetrics> {
    const response = await apiClient.get(`/api/v1/analytics/performance?timeframe=${timeframe}`);
    return response.data;
  }

  async getGoalPerformance(goalId: string): Promise<{
    matches: number;
    successRate: number;
    tokensSpent: number;
    savings: number;
    history: Array<{
      date: string;
      matches: number;
      tokens: number;
    }>;
  }> {
    const response = await apiClient.get(`/api/v1/analytics/goals/${goalId}/performance`);
    return response.data;
  }

  async getDealAnalytics(dealId: string): Promise<{
    views: number;
    saves: number;
    conversions: number;
    priceHistory: Array<{
      date: string;
      price: number;
    }>;
  }> {
    const response = await apiClient.get(`/api/v1/analytics/deals/${dealId}`);
    return response.data;
  }

  async getTokenUsage(period: 'day' | 'week' | 'month' | 'year'): Promise<{
    usage: Array<{
      date: string;
      amount: number;
      category: string;
      description?: string;
      type?: string;
    }>;
    summary: {
      total: number;
      byCategory: Record<string, number>;
    };
  }> {
    const response = await apiClient.get(`/api/v1/analytics/tokens/usage?period=${period}`);
    return response.data;
  }

  async getActivityHistory(page: number = 1, limit: number = 10): Promise<{
    items: DashboardMetrics['activity'];
    total: number;
    page: number;
    pages: number;
  }> {
    const response = await apiClient.get(`/api/v1/analytics/activity?page=${page}&limit=${limit}`);
    return response.data;
  }
}

export const analyticsService = new AnalyticsService(); 