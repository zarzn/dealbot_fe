import { goalsService } from '@/services/goals';

/**
 * Hook for accessing the goals service
 * @returns The goals service instance
 */
export function useGoalsService() {
  return goalsService;
} 