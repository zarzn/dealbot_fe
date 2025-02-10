import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  constraints: {
    maxPrice: number;
    condition?: string;
    shippingInfo?: {
      price: number;
      estimatedDays: number;
      freeShipping: boolean;
    };
    features?: string[];
  };
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
  createdAt?: string;
  updatedAt?: string;
}

export const goalsService = {
  async createGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const response = await axios.post(`${API_URL}/api/v1/goals`, goal);
      return response.data;
    } catch (error) {
      console.error('Failed to create goal:', error);
      throw error;
    }
  },

  async getGoals() {
    try {
      const response = await axios.get(`${API_URL}/api/v1/goals`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      throw error;
    }
  },

  async updateGoal(id: string, updates: Partial<Goal>) {
    try {
      const response = await axios.patch(`${API_URL}/api/v1/goals/${id}`, updates);
      return response.data;
    } catch (error) {
      console.error('Failed to update goal:', error);
      throw error;
    }
  },

  async deleteGoal(id: string) {
    try {
      await axios.delete(`${API_URL}/api/v1/goals/${id}`);
    } catch (error) {
      console.error('Failed to delete goal:', error);
      throw error;
    }
  },

  async getGoalById(id: string) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/goals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch goal:', error);
      throw error;
    }
  },

  async getPriceHistory(id: string) {
    try {
      const response = await axios.get(`${API_URL}/api/v1/goals/${id}/price-history`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch price history:', error);
      throw error;
    }
  }
}; 