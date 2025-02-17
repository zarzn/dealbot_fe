"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { createGoalSchema, type CreateGoalInput } from '@/lib/validations/goal';
import { marketCategories, goalPriorities } from '@/lib/validations/goal';
import { goalsService } from '@/services/goals';
import { walletService } from '@/services/wallet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Skeleton } from '@/components/ui/skeleton';
import GoalCostModal from './GoalCostModal';

interface CreateGoalFormProps {
  onSuccess?: () => void;
}

export function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [goalCost, setGoalCost] = useState<{ tokenCost: number; features: string[] } | null>(null);
  const [balance, setBalance] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      marketplaces: ['Amazon', 'Walmart'],
      priority: 'medium',
      notifications: {
        email: true,
        inApp: true,
        priceThreshold: 0.9,
      },
      constraints: {
        conditions: ['any'],
        brands: [],
        features: [],
        keywords: [],
      },
    },
  });

  const loadWalletBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const loadGoalCost = async (data: CreateGoalInput) => {
    try {
      const cost = await goalsService.getGoalCost();
      setGoalCost(cost);
      setShowCostModal(true);
    } catch (error) {
      console.error('Failed to get goal cost:', error);
      toast.error('Failed to get goal cost');
    }
  };

  const onSubmit = async (data: CreateGoalInput) => {
    await loadGoalCost(data);
  };

  const handleConfirmCreate = async () => {
    const data = watch();
    setIsLoading(true);
    try {
      await goalsService.createGoal(data);
      toast.success('Goal created successfully!');
      onSuccess?.();
      router.push('/dashboard/goals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create goal');
    } finally {
      setIsLoading(false);
      setShowCostModal(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            {...register('title')}
            placeholder="e.g., Gaming Monitor Deal"
            error={errors.title?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea
            {...register('description')}
            placeholder="Describe what you're looking for..."
            error={errors.description?.message}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Category</label>
          <Select
            onValueChange={(value) => setValue('itemCategory', value)}
            defaultValue={watch('itemCategory')}
          >
            <SelectTrigger error={errors.itemCategory?.message}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {marketCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Price Range</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Minimum Price ($)</label>
            <Input
              type="number"
              {...register('constraints.minPrice', { valueAsNumber: true })}
              placeholder="0"
              error={errors.constraints?.minPrice?.message}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Price ($)</label>
            <Input
              type="number"
              {...register('constraints.maxPrice', { valueAsNumber: true })}
              placeholder="1000"
              error={errors.constraints?.maxPrice?.message}
            />
          </div>
        </div>
      </div>

      {/* Keywords and Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Search Criteria</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Keywords</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword and press Enter"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.currentTarget;
                  const value = input.value.trim();
                  if (value) {
                    const keywords = watch('constraints.keywords') || [];
                    setValue('constraints.keywords', [...keywords, value]);
                    input.value = '';
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const keywords = watch('constraints.keywords') || [];
                setValue('constraints.keywords', []);
              }}
            >
              Clear
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {watch('constraints.keywords')?.map((keyword, index) => (
              <div
                key={index}
                className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded-lg"
              >
                <span className="text-sm">{keyword}</span>
                <button
                  type="button"
                  className="text-white/50 hover:text-white"
                  onClick={() => {
                    const keywords = watch('constraints.keywords') || [];
                    setValue(
                      'constraints.keywords',
                      keywords.filter((_, i) => i !== index)
                    );
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {errors.constraints?.keywords?.message && (
            <p className="text-sm text-red-500 mt-1">
              {errors.constraints.keywords.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Condition</label>
          <div className="flex flex-wrap gap-4">
            {['new', 'used', 'refurbished', 'any'].map((condition) => (
              <label key={condition} className="flex items-center gap-2">
                <Checkbox
                  checked={watch('constraints.conditions')?.includes(condition)}
                  onCheckedChange={(checked) => {
                    const conditions = watch('constraints.conditions') || [];
                    if (checked) {
                      setValue('constraints.conditions', [...conditions, condition]);
                    } else {
                      setValue(
                        'constraints.conditions',
                        conditions.filter((c) => c !== condition)
                      );
                    }
                  }}
                />
                <span className="text-sm capitalize">{condition}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Priority and Deadline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Priority & Timing</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority</label>
          <div className="flex gap-4">
            {goalPriorities.map((priority) => (
              <Button
                key={priority}
                type="button"
                variant={watch('priority') === priority ? 'default' : 'outline'}
                onClick={() => setValue('priority', priority)}
              >
                <span className="capitalize">{priority}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline (Optional)</label>
          <DatePicker
            selected={watch('deadline')}
            onSelect={(date) => setValue('deadline', date)}
            minDate={new Date()}
            placeholderText="Select a deadline"
          />
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        
        <div className="space-y-4">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={watch('notifications.email')}
              onCheckedChange={(checked) => 
                setValue('notifications.email', checked)
              }
            />
            <span className="text-sm">Email Notifications</span>
          </label>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={watch('notifications.inApp')}
              onCheckedChange={(checked) =>
                setValue('notifications.inApp', checked)
              }
            />
            <span className="text-sm">In-App Notifications</span>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Price Drop Threshold (%)
            </label>
            <Input
              type="number"
              {...register('notifications.priceThreshold', { valueAsNumber: true })}
              placeholder="90"
              min="0"
              max="100"
              step="1"
              error={errors.notifications?.priceThreshold?.message}
            />
            <p className="text-sm text-white/50">
              Notify me when price drops below this percentage of the target price
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/goals')}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Goal'}
        </Button>
      </div>

      {/* Cost Modal */}
      {goalCost && (
        <GoalCostModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          onConfirm={handleConfirmCreate}
          cost={goalCost}
          balance={balance}
        />
      )}
    </form>
  );
} 