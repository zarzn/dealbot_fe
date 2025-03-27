"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { 
  updateGoalSchema, 
  type UpdateGoalInput,
  marketCategories,
  goalPriorities,
  goalPriorityLabels
} from '@/lib/validations/goal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectItem } from '@/components/ui/select';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { goalsService } from "@/services/goals";
import type { Goal } from "@/services/goals";
import { cn } from '@/lib/utils';

// Convert market categories to objects with value/label for the select component
const MARKET_CATEGORY_OPTIONS = marketCategories.map(category => ({
  value: category,
  label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
}));

interface EditGoalFormProps {
  goal: Goal;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Custom styles for the select dropdown to match the dashboard theme
const SELECT_STYLES = `
  .select {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
  
  .select-trigger {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    border-radius: 0.375rem !important;
    height: 2.5rem !important;
    padding: 0 0.75rem !important;
  }
  
  .select-content {
    background-color: rgba(23, 23, 23, 0.95) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  .select-item {
    color: white !important;
  }
  
  .select-item:hover,
  .select-item:focus {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  select {
    background-color: rgba(255, 255, 255, 0.05) !important;
    border-color: rgba(255, 255, 255, 0.1) !important;
    color: white !important;
  }
  
  select option {
    background-color: #1a1a1a !important;
    color: white !important;
  }
`;

export function EditGoalForm({ goal, onSuccess, onCancel }: EditGoalFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [brandInput, setBrandInput] = useState('');

  // Initialize form with react-hook-form
  const form = useForm<UpdateGoalInput>({
    resolver: zodResolver(updateGoalSchema),
    defaultValues: {
      title: goal.title || '',
      description: goal.title || '', // Use title as fallback since description might not exist in the Goal interface
      item_category: (goal.itemCategory as any) || 'electronics',
      marketplaces: [goal.source || 'amazon'],
      constraints: {
        min_price: (goal.constraints as any)?.minPrice || 0,
        max_price: (goal.constraints as any)?.maxPrice || 1000,
        keywords: goal.constraints?.keywords || [],
        brands: goal.constraints?.brands || [],
        conditions: goal.constraints?.conditions || ['new'],
        features: goal.constraints?.features || [],
      },
      notifications: {
        email: goal.notifications?.email === undefined ? true : goal.notifications.email,
        inApp: goal.notifications?.inApp === undefined ? true : goal.notifications.inApp,
        priceThreshold: goal.notifications?.priceThreshold === undefined ? 0.8 : goal.notifications.priceThreshold,
      },
      priority: goal.priority ? 
        // Convert string priority to number if needed
        (typeof goal.priority === 'string' ? 
          (goal.priority === 'low' ? 1 : goal.priority === 'medium' ? 2 : 3) : 
          Number(goal.priority)) : 
        2, // Default to Medium priority
      deadline: goal.deadline ? new Date(goal.deadline) : undefined,
      notification_threshold: 0.1, // Default value if not present in goal
    },
  });

  // Extract form methods
  const { handleSubmit, watch, setValue, formState: { errors } } = form;

  // Watch keywords and brands arrays for updates
  const keywords = watch('constraints.keywords') || [];
  const brands = watch('constraints.brands') || [];

  // Form submission handler
  const onSubmit = async (data: UpdateGoalInput) => {
    console.log("Form submission triggered:", { data });
    
    setIsLoading(true);
    try {
      // Convert priority number to string format expected by API
      let priorityStr: 'low' | 'medium' | 'high' = 'medium';
      if (data.priority === 1) priorityStr = 'low';
      else if (data.priority === 2) priorityStr = 'medium';
      else priorityStr = 'high';
      
      // Format the data for API consumption - using the Goal interface structure
      const apiUpdateData: Partial<Goal> = {
        title: data.title,
        itemCategory: data.item_category as string,
        constraints: {
          minPrice: data.constraints?.min_price,
          maxPrice: data.constraints?.max_price,
          keywords: data.constraints?.keywords,
          brands: data.constraints?.brands,
          conditions: data.constraints?.conditions,
          features: data.constraints?.features,
        } as any, // Cast to any to avoid type errors with property names
        notifications: {
          email: !!data.notifications?.email,
          inApp: !!data.notifications?.inApp,
          priceThreshold: data.notifications?.priceThreshold || 0.8,
        },
        priority: priorityStr,
        deadline: data.deadline ? data.deadline.toISOString() : undefined,
        status: data.status || 'active',
      };
      
      // Update goal via API
      await goalsService.updateGoal(goal.id!, apiUpdateData);
      toast.success("Goal updated successfully");
      onSuccess?.();
    } catch (error: any) {
      console.error("Error updating goal:", error);
      toast.error(error.message || "Failed to update goal");
    } finally {
      setIsLoading(false);
    }
  };

  // Add a keyword to the form
  const addKeyword = () => {
    if (!keywordInput.trim()) return;
    
    const currentKeywords = watch('constraints.keywords') || [];
    if (!currentKeywords.includes(keywordInput.trim())) {
      setValue('constraints.keywords', [...currentKeywords, keywordInput.trim()]);
    }
    setKeywordInput('');
  };

  // Remove a keyword from the form
  const removeKeyword = (keyword: string) => {
    const currentKeywords = watch('constraints.keywords') || [];
    setValue('constraints.keywords', currentKeywords.filter(k => k !== keyword));
  };

  // Add a brand to the form
  const addBrand = () => {
    if (!brandInput.trim()) return;
    
    const currentBrands = watch('constraints.brands') || [];
    if (!currentBrands.includes(brandInput.trim())) {
      setValue('constraints.brands', [...currentBrands, brandInput.trim()]);
    }
    setBrandInput('');
  };

  // Remove a brand from the form
  const removeBrand = (brand: string) => {
    const currentBrands = watch('constraints.brands') || [];
    setValue('constraints.brands', currentBrands.filter(b => b !== brand));
  };

  // Format date for input display
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  };

  return (
    <div className="w-full mx-auto">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your goal" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear and specific title for your goal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="item_category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    {MARKET_CATEGORY_OPTIONS.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <FormDescription>
                    Choose the category that best fits your goal.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your goal in detail"
                    className="resize-none h-32"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide detailed information about your goal, including any specific requirements or constraints.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="constraints.conditions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Item Condition</FormLabel>
                    <FormDescription>
                      Select acceptable item conditions.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {['new', 'used', 'refurbished', 'open_box'].map((condition) => (
                      <FormField
                        key={condition}
                        control={form.control}
                        name="constraints.conditions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={condition}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(condition)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, condition])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== condition
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {condition
                                  .split('_')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ')}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        <Slider
                          min={1}
                          max={5}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                          className="w-full"
                        />
                        <div className="flex justify-between">
                          {goalPriorities.map((priority) => (
                            <div 
                              key={priority} 
                              className={`text-xs ${field.value === priority ? 'text-blue-400 font-bold' : 'text-muted-foreground'}`}
                            >
                              {goalPriorityLabels[priority]}
                            </div>
                          ))}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Higher priority goals receive faster and more accurate matches.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="constraints.min_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="constraints.max_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="1000.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormItem>
              <FormLabel>Keywords</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Enter keyword"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={addKeyword} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('constraints.keywords')?.map((keyword) => (
                  <Badge key={keyword} className="px-3 py-1">
                    {keyword}
                    <button
                      type="button"
                      className="ml-2 text-xs"
                      onClick={() => removeKeyword(keyword)}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add keywords to refine your search (optional).
              </FormDescription>
            </FormItem>
            
            <FormItem>
              <FormLabel>Brands</FormLabel>
              <div className="flex gap-2">
                <Input
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  placeholder="Enter brand"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addBrand();
                    }
                  }}
                />
                <Button type="button" onClick={addBrand} variant="secondary">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {watch('constraints.brands')?.map((brand) => (
                  <Badge key={brand} className="px-3 py-1">
                    {brand}
                    <button
                      type="button"
                      className="ml-2 text-xs"
                      onClick={() => removeBrand(brand)}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
              <FormDescription>
                Add brands to filter your search results (optional).
              </FormDescription>
            </FormItem>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="notifications.priceThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price Alert Threshold</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        min={0.5}
                        max={0.95}
                        step={0.05}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                      />
                      <div className="flex relative h-5">
                        <span className="absolute text-xs text-muted-foreground" style={{left: '0%'}}>50%</span>
                        <span className="absolute text-xs text-muted-foreground" style={{left: '20%'}}>60%</span>
                        <span className="absolute text-xs text-muted-foreground" style={{left: '40%'}}>70%</span>
                        <span className="absolute text-xs text-muted-foreground" style={{left: '60%'}}>80%</span>
                        <span className="absolute text-xs text-muted-foreground" style={{left: '80%'}}>90%</span>
                        <span className="absolute text-xs text-muted-foreground" style={{left: '100%', transform: 'translateX(-100%)'}}>95%</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    You&apos;ll be notified when a deal is found at or below <span className="font-semibold">{(field.value * 100).toFixed(0)}%</span> of your maximum price.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field: { value, onChange } }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Deadline (Optional)</FormLabel>
                  <div className="space-y-2">
                    <DatePicker
                      selected={value ? new Date(value) : undefined}
                      onSelect={(date) => {
                        console.log("Date selected:", date);
                        onChange(date);
                      }}
                      minDate={new Date()} // Can't select dates in the past
                      placeholderText="Select deadline date"
                    />
                    {value && (
                      <div className="text-xs text-muted-foreground">
                        Selected: {new Date(value).toLocaleDateString()} 
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 ml-2" 
                          onClick={() => onChange(undefined)}
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    Set a deadline for your goal (optional). Must be a future date.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-1 gap-2">
              <FormField
                control={form.control}
                name="notifications.email"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive updates about your goal via email.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notifications.inApp"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>In-App Notifications</FormLabel>
                      <FormDescription>
                        Receive updates within the app.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
      
      {/* Add custom styles */}
      <style jsx global>{SELECT_STYLES}</style>
    </div>
  );
} 