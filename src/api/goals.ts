import axios from 'axios';
import { GoalResponse, GoalCreate, GoalUpdate, GoalAnalytics } from '@/types/goals';
import { API_CONFIG } from '@/services/api/config';

// Create axios instance with default config
const goalsApi = axios.create({
  baseURL: `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/goals`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the API URL in development mode
if (process.env.NODE_ENV === 'development') {
  console.log('Goals API using URL:', `${API_CONFIG.baseURL}/api/${API_CONFIG.version}/goals`);
}

// Add request interceptor to include auth token
goalsApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getGoals = async (): Promise<GoalResponse[]> => {
  const { data } = await goalsApi.get('/');
  return data;
};

export const getGoal = async (goalId: string): Promise<GoalResponse> => {
  const { data } = await goalsApi.get(`/${goalId}`);
  return data;
};

export const createGoal = async (goal: GoalCreate): Promise<GoalResponse> => {
  const { data } = await goalsApi.post('/', goal);
  return data;
};

export const updateGoal = async (goalId: string, goal: GoalUpdate): Promise<GoalResponse> => {
  const { data } = await goalsApi.put(`/${goalId}`, goal);
  return data;
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  await goalsApi.delete(`/${goalId}`);
};

export const getGoalAnalytics = async (goalId: string): Promise<GoalAnalytics> => {
  const { data } = await goalsApi.get(`/${goalId}/analytics`);
  return data;
}; 