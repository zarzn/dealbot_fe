"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { 
  createGoalSchema, 
  type CreateGoalInput, 
  marketCategories, 
  goalPriorities,
  goalPriorityLabels
} from '@/lib/validations/goal';
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
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import GoalCostModal from './GoalCostModal';

// Add these interfaces if they don't exist in the codebase
interface Market {
  id: string;
  type: string;
  name: string;
  status: string;
}

interface CreateGoalFormProps {
  onSuccess?: () => void;
}

export function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [baseCost, setBaseCost] = useState(5); // Base cost without multiplier
  const [adjustedCost, setAdjustedCost] = useState(5); // Cost after applying priority multiplier
  const [balance, setBalance] = useState(0);
  const [availableMarkets] = useState<string[]>(['amazon', 'walmart']);
  const [keywordInput, setKeywordInput] = useState('');
  const [brandInput, setBrandInput] = useState('');

  // Initialize form with default values
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateGoalInput>({
    resolver: zodResolver(createGoalSchema),
    defaultValues: {
      title: '',
      description: '',
      item_category: 'electronics',
      marketplaces: ['amazon'],
      constraints: {
        min_price: 0,
        max_price: 1000,
        keywords: [],
        brands: [],
        conditions: ['new'],
      },
      notifications: {
        email: true,
        inApp: true,
        priceThreshold: 0.8, // Notify when price is 80% of target
      },
      priority: 2, // Default to Medium priority
    },
  });

  // Fetch wallet balance and goal cost
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get wallet balance
        const balanceData = await walletService.getBalance();
        setBalance(typeof balanceData === 'number' ? balanceData : 0);

        // Get goal cost - since we know the format of the data
        try {
          const costData = await goalsService.getGoalCost();
          setBaseCost(typeof costData.tokenCost === 'number' ? costData.tokenCost : 5);
        } catch (costError) {
          console.error('Error fetching goal cost, using default', costError);
          setBaseCost(5); // Default fallback
        }
      } catch (error) {
        console.error('Failed to fetch data', error);
        toast.error('Failed to load required data');
      }
    };

    fetchData();
  }, []);

  // Watch priority to dynamically adjust cost
  const currentPriority = watch('priority');
  useEffect(() => {
    // Adjust cost based on priority
    const priorityMultiplier = {
      1: 0.8,  // Low priority - discount
      2: 1.0,  // Medium priority - standard cost
      3: 1.2,  // High priority - 20% premium
      4: 1.5,  // Urgent - 50% premium
      5: 2.0   // Critical - double cost
    };
    
    // Calculate cost using safe multiplication to avoid floating point issues
    const multiplier = priorityMultiplier[currentPriority as keyof typeof priorityMultiplier] || 1.0;
    const calculated = Number((baseCost * multiplier).toFixed(1));
    setAdjustedCost(calculated);
  }, [currentPriority, baseCost]);

  const onSubmit: SubmitHandler<CreateGoalInput> = async (data) => {
    try {
      // Check if user has enough balance
      if (typeof balance !== 'number' || balance < adjustedCost) {
        toast.error('Insufficient balance to create goal');
        return;
      }

      // Show confirmation modal
      setShowCostModal(true);
    } catch (error) {
      console.error('Error checking balance:', error);
      toast.error('An error occurred. Please try again.');
    }
  };

  const handleConfirmCreate = async () => {
    const data = watch();
    setIsLoading(true);
    try {
      await goalsService.createGoal(data);
      await walletService.getBalance(); // Refresh balance after goal creation
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

  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    const currentKeywords = watch('constraints.keywords') || [];
    if (currentKeywords.includes(keywordInput.trim())) {
      toast.error('Keyword already added');
      return;
    }
    
    setValue('constraints.keywords', [...currentKeywords, keywordInput.trim()]);
    setKeywordInput('');
  };

  const removeKeyword = (keyword: string) => {
    const currentKeywords = watch('constraints.keywords') || [];
    setValue(
      'constraints.keywords',
      currentKeywords.filter(k => k !== keyword)
    );
  };

  const addBrand = () => {
    if (!brandInput.trim()) return;
    
    const currentBrands = watch('constraints.brands') || [];
    if (currentBrands.includes(brandInput.trim())) {
      toast.error('Brand already added');
      return;
    }
    
    setValue('constraints.brands', [...currentBrands, brandInput.trim()]);
    setBrandInput('');
  };

  const removeBrand = (brand: string) => {
    const currentBrands = watch('constraints.brands') || [];
    setValue(
      'constraints.brands',
      currentBrands.filter(b => b !== brand)
    );
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
          <select
            {...register('item_category')}
            className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
          >
            {marketCategories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
          {errors.item_category && <p className="text-red-500 text-sm">{errors.item_category.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Marketplaces</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'amazon', name: 'Amazon', available: true, icon: '🛒' },
              { id: 'walmart', name: 'Walmart', available: true, icon: '🛍️' },
              { id: 'ebay', name: 'eBay', available: false, icon: '🏷️' },
              { id: 'target', name: 'Target', available: false, icon: '🎯' },
              { id: 'bestbuy', name: 'Best Buy', available: false, icon: '💻' },
            ].map((marketplace) => {
              const isAvailable = availableMarkets.includes(marketplace.id);
              const isSelected = watch('marketplaces')?.includes(marketplace.id);
              
              return (
                <div 
                  key={marketplace.id}
                  onClick={() => {
                    if (!isAvailable) {
                      toast.error(`${marketplace.name} is not available yet`);
                      return;
                    }
                    
                    const marketplaces = watch('marketplaces') || [];
                    if (isSelected) {
                      // Don't allow deselecting if it's the last selected marketplace
                      if (marketplaces.length <= 1) {
                        toast.error('At least one marketplace must be selected');
                        return;
                      }
                      
                      setValue(
                        'marketplaces',
                        marketplaces.filter(m => m !== marketplace.id)
                      );
                    } else {
                      setValue('marketplaces', [...marketplaces, marketplace.id]);
                    }
                  }}
                  className={`
                    flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                    ${isAvailable ? 'border-gray-600' : 'border-gray-800 opacity-50'}
                    ${isSelected && isAvailable ? 'bg-primary/20 border-primary' : 'bg-transparent'}
                  `}
                >
                  <span className="text-xl mr-2">{marketplace.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium">{marketplace.name}</div>
                    {!isAvailable && (
                      <div className="text-xs text-gray-500">Coming soon</div>
                    )}
                  </div>
                  {isSelected && isAvailable && (
                    <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {errors.marketplaces && <p className="text-red-500 text-sm">{errors.marketplaces.message}</p>}
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
              {...register('constraints.min_price', { valueAsNumber: true })}
              placeholder="0"
              error={errors.constraints?.min_price?.message}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Maximum Price ($)</label>
            <Input
              type="number"
              {...register('constraints.max_price', { valueAsNumber: true })}
              placeholder="1000"
              error={errors.constraints?.max_price?.message}
            />
          </div>
        </div>
        {errors.constraints?.message && (
          <p className="text-red-500 text-sm">{errors.constraints.message}</p>
        )}
      </div>

      {/* Keywords and Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Search Criteria</h3>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Keywords</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter keyword and press Enter"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addKeyword();
                }
              }}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addKeyword}
              variant="outline"
              className="shrink-0"
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {watch('constraints.keywords')?.map((keyword) => (
              <div 
                key={keyword} 
                className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {keyword}
                <button 
                  type="button"
                  onClick={() => removeKeyword(keyword)}
                  className="ml-1 text-xs hover:bg-gray-600 rounded-full h-4 w-4 inline-flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {watch('constraints.keywords')?.length === 0 && (
              <div className="text-sm text-gray-500 italic">No keywords added yet</div>
            )}
          </div>
          {errors.constraints?.keywords && (
            <p className="text-red-500 text-sm">{errors.constraints.keywords.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Brands</label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter brand and press Enter"
              value={brandInput}
              onChange={(e) => setBrandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addBrand();
                }
              }}
              className="flex-1"
            />
            <Button 
              type="button" 
              onClick={addBrand}
              variant="outline"
              className="shrink-0"
            >
              Add
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2">
            {watch('constraints.brands')?.map((brand) => (
              <div 
                key={brand} 
                className="flex items-center gap-1 px-3 py-1.5 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {brand}
                <button 
                  type="button"
                  onClick={() => removeBrand(brand)}
                  className="ml-1 text-xs hover:bg-gray-600 rounded-full h-4 w-4 inline-flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
            {watch('constraints.brands')?.length === 0 && (
              <div className="text-sm text-gray-500 italic">No brands added yet</div>
            )}
          </div>
          {errors.constraints?.brands && (
            <p className="text-red-500 text-sm">{errors.constraints.brands.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Condition</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'new', label: 'New', description: 'Brand new, unused items' },
              { id: 'used', label: 'Used', description: 'Used items in good condition' },
              { id: 'refurbished', label: 'Refurbished', description: 'Professionally restored' },
              { id: 'open_box', label: 'Open Box', description: 'Opened but unused' },
              { id: 'renewed', label: 'Renewed', description: 'Inspected and guaranteed' },
            ].map((condition) => {
              const isSelected = watch('constraints.conditions')?.includes(condition.id);
              
              return (
                <div 
                  key={condition.id}
                  onClick={() => {
                    const conditions = watch('constraints.conditions') || [];
                    // Don't allow deselecting if it would leave no conditions selected
                    if (isSelected && conditions.length <= 1) {
                      toast.error('At least one condition must be selected');
                      return;
                    }
                    
                    if (isSelected) {
                      setValue(
                        'constraints.conditions',
                        conditions.filter(c => c !== condition.id)
                      );
                    } else {
                      setValue('constraints.conditions', [...conditions, condition.id]);
                    }
                  }}
                  className={`
                    flex items-center gap-2 p-3 border rounded-lg cursor-pointer
                    ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-600'}
                  `}
                >
                  <div className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center ${
                    isSelected ? 'bg-primary border-primary' : 'border-gray-400'
                  }`}>
                    {isSelected && <span className="text-white text-xs">✓</span>}
                  </div>
                  <div>
                    <div className="font-medium">{condition.label}</div>
                    <div className="text-xs text-gray-400">{condition.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.constraints?.conditions && (
            <p className="text-red-500 text-sm">{errors.constraints.conditions.message}</p>
          )}
        </div>
      </div>

      {/* Priority and Deadline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Priority & Timing</h3>
        
        <div className="space-y-4">
          <label className="text-sm font-medium">
            Priority Level - {goalPriorityLabels[watch('priority')]}
            <span className="ml-2 text-xs text-white/70">
              (Cost: {adjustedCost.toFixed(1)} tokens)
            </span>
          </label>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
                <span>Urgent</span>
                <span>Critical</span>
              </div>
              <input 
                type="range"
                min="1"
                max="5"
                step="1"
                value={watch('priority')}
                onChange={(e) => setValue('priority', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/20 rounded">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">
                {watch('priority')}
              </div>
              <div>
                <p className="font-medium">{goalPriorityLabels[watch('priority')]}</p>
                <p className="text-xs text-white/70">
                  {watch('priority') === 1 && "Lowest priority, least expensive option"}
                  {watch('priority') === 2 && "Standard priority with normal cost"}
                  {watch('priority') === 3 && "Higher priority with 20% premium"}
                  {watch('priority') === 4 && "Urgent priority with 50% premium"}
                  {watch('priority') === 5 && "Critical priority, double the token cost"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline (Optional)</label>
          <DatePicker
            selected={watch('deadline')}
            onSelect={(date) => setValue('deadline', date ?? undefined)}
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
                setValue('notifications.email', !!checked)
              }
            />
            <span className="text-sm">Email Notifications</span>
          </label>

          <label className="flex items-center gap-2">
            <Checkbox
              checked={watch('notifications.inApp')}
              onCheckedChange={(checked) =>
                setValue('notifications.inApp', !!checked)
              }
            />
            <span className="text-sm">In-App Notifications</span>
          </label>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Deal Quality Threshold ({(watch('notifications.priceThreshold') * 100).toFixed(0)}%)
            </label>
            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={watch('notifications.priceThreshold') * 100}
              onChange={(e) => setValue('notifications.priceThreshold', parseInt(e.target.value) / 100)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/70">
              <span>Any Deal (0%)</span>
              <span>Perfect Match (100%)</span>
            </div>
            <p className="text-sm text-white/50">
              Notify me only when matches are above this quality threshold
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
      {showCostModal && (
        <GoalCostModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          onConfirm={handleConfirmCreate}
          cost={adjustedCost}
          balance={balance}
        />
      )}
    </form>
  );
} 