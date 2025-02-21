import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GoalCreate, GoalUpdate, GoalResponse, GoalAnalytics } from '@/types/goals';
import * as goalsApi from '@/api/goals';
import { toast } from '@/components/ui/use-toast';

export const useGoals = () => {
  return useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getGoals,
  });
};

export const useGoal = (goalId: string) => {
  return useQuery({
    queryKey: ['goals', goalId],
    queryFn: () => goalsApi.getGoal(goalId),
    enabled: !!goalId,
  });
};

export const useCreateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: goalsApi.createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Goal created',
        description: 'Your goal has been created successfully.',
      });
    },
  });
};

export const useUpdateGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ goalId, goal }: { goalId: string; goal: GoalUpdate }) =>
      goalsApi.updateGoal(goalId, goal),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: ['goals', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Goal updated',
        description: 'Your goal has been updated successfully.',
      });
    },
  });
};

export const useDeleteGoal = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: goalsApi.deleteGoal,
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: ['goals', goalId] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      toast({
        title: 'Goal deleted',
        description: 'Your goal has been deleted successfully.',
      });
    },
  });
};

export const useGoalAnalytics = (goalId: string) => {
  return useQuery({
    queryKey: ['goals', goalId, 'analytics'],
    queryFn: () => goalsApi.getGoalAnalytics(goalId),
    enabled: !!goalId,
  });
}; 