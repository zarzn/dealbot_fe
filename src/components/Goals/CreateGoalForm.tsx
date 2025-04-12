"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { AlertCircle, ShoppingCart, Store, ShoppingBag } from 'lucide-react';
import { 
  createGoalSchema, 
  type CreateGoalInput, 
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/ui/date-picker';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { GoalCostModal } from './GoalCostModal';
import { useGoalsService } from "@/hooks/useGoalsService";
import { useWalletService } from "@/hooks/useWalletService";
import SimpleModal from "@/components/SimpleModal";

// Convert market categories to objects with value/label for the select component
const MARKET_CATEGORY_OPTIONS = marketCategories.map(category => ({
  value: category,
  label: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')
}));

interface CreateGoalFormProps {
  onSuccess?: () => void;
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

export function CreateGoalForm({ onSuccess }: CreateGoalFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [showFallbackModal, setShowFallbackModal] = useState(false);
  const [baseCost, setBaseCost] = useState(5);
  const [adjustedCost, setAdjustedCost] = useState(5);
  const [balance, setBalance] = useState(0);
  const [availableMarkets] = useState<string[]>(['amazon', 'walmart', 'google_shopping']);
  const [keywordInput, setKeywordInput] = useState('');
  const [brandInput, setBrandInput] = useState('');
  const [showInsufficientBalanceAlert, setShowInsufficientBalanceAlert] = useState(false);
  const [costFeatures, setCostFeatures] = useState<string[]>([]);
  const [formData, setFormData] = useState<CreateGoalInput | null>(null);
  const goalsService = useGoalsService();
  const walletService = useWalletService();

  // Define market icons mapping
  const marketIcons = {
    amazon: <ShoppingCart className="h-4 w-4 mr-2" />,
    walmart: <Store className="h-4 w-4 mr-2" />,
    google_shopping: <ShoppingBag className="h-4 w-4 mr-2" />
  };

  // Initialize form with react-hook-form
  const form = useForm<CreateGoalInput>({
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

  // Extract form methods
  const { handleSubmit, watch, setValue } = form;

  // Fetch wallet balance and goal cost
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching wallet balance and goal cost data...');
        
        // Get wallet balance
        try {
          const balance = await walletService.getBalance();
          console.log('Retrieved balance:', balance);
          
          // Ensure balance is a number and not NaN
          const safeBalance = typeof balance === 'number' && !isNaN(balance) ? balance : 0;
          setBalance(safeBalance);
        } catch (balanceError) {
          console.error('Error fetching balance:', balanceError);
          // Set a default of 0 for safety
          setBalance(0);
        }

        // Get goal cost from backend
        try {
          const costData = await goalsService.getGoalCost();
          console.log('Retrieved goal cost data:', costData);
          
          if (typeof costData.tokenCost === 'number' && !isNaN(costData.tokenCost)) {
            setBaseCost(costData.tokenCost);
          } else {
            console.warn('Invalid token cost received, using default');
            setBaseCost(5); // Default fallback
          }
          
          // Set features if available
          if (costData.features && Array.isArray(costData.features)) {
            setCostFeatures(costData.features);
          } else {
            // Default features
            setCostFeatures([
              "AI-powered goal optimization",
              "Smart progress tracking",
              "Real-time deal alerts",
              "Priority matching with new deals"
            ]);
          }
        } catch (costError) {
          console.error('Error fetching goal cost:', costError);
          setBaseCost(5); // Default fallback
          
          // Set default features
          setCostFeatures([
            "AI-powered goal optimization",
            "Smart progress tracking",
            "Real-time deal alerts",
            "Priority matching with new deals"
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch wallet or cost data:', error);
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
    console.log('Cost calculation:', { 
      baseCost,
      priority: currentPriority, 
      multiplier, 
      calculatedCost: calculated
    });
    setAdjustedCost(calculated);
  }, [currentPriority, baseCost]);

  // Update insufficient balance alert when balance or cost changes
  useEffect(() => {
    // Update the alert visibility based on balance and cost
    setShowInsufficientBalanceAlert(balance < adjustedCost);
    console.log('Checking balance status:', { 
      balance, 
      adjustedCost, 
      insufficient: balance < adjustedCost 
    });
  }, [balance, adjustedCost]);

  // Form submission handler
  const onSubmit = async (data: CreateGoalInput) => {
    console.log("Form submission triggered:", { data });
    
    // Save form data for later use
    setFormData(data);
    
    // Show processing toast instead of loading
    const toastId = toast("Processing your request...");
    
    try {
      // Get current balance
      const currentBalance = await walletService.getBalance();
      console.log("Current balance:", currentBalance, "Required:", adjustedCost);
      
      // Ensure currentBalance is a number and not NaN
      const safeBalance = typeof currentBalance === 'number' && !isNaN(currentBalance) ? currentBalance : 0;
      setBalance(safeBalance);
      
      // Show appropriate toast based on balance
      if (safeBalance < adjustedCost) {
        console.log("Insufficient balance:", safeBalance, "< cost:", adjustedCost);
        toast.error(`Insufficient balance: ${safeBalance.toFixed(1)} tokens (need ${adjustedCost.toFixed(1)})`, {
          id: toastId
        });
        
        // Show the alert banner
        setShowInsufficientBalanceAlert(true);
      } else {
        toast.success(`Creating goal will cost ${adjustedCost.toFixed(1)} tokens`, {
          id: toastId
        });
        
        // Hide the alert banner if it was previously shown
        setShowInsufficientBalanceAlert(false);
      }
      
      // Show cost modal regardless of balance
      console.log("Showing cost modal");
      setShowCostModal(true);
      
    } catch (error) {
      console.error("Error checking balance:", error);
      toast.error("Failed to check your token balance", {
        id: toastId
      });
      
      // Show fallback modal since we couldn't check balance
      setShowFallbackModal(true);
    }
  };

  const handleConfirmCreate = async () => {
    console.log("Confirm create clicked", formData);
    
    // Final balance check before creation
    try {
      const finalBalance = await walletService.getBalance();
      console.log("Final balance check:", finalBalance, "Cost:", adjustedCost);
      
      // Ensure finalBalance is a number and not NaN
      const safeFinalBalance = typeof finalBalance === 'number' && !isNaN(finalBalance) ? finalBalance : 0;
      
      if (safeFinalBalance < adjustedCost) {
        console.error("Insufficient balance in final check");
        toast.error(`Insufficient balance for goal creation.`);
        return;
      }
      
      // Proceed with goal creation
      if (formData) {
        setIsLoading(true);
        const toastId = toast("Creating goal...");
        
        try {
          console.log("Creating goal with data:", formData);
          const goal = await goalsService.createGoal(formData);
          console.log("Goal created:", goal);
          toast.success("Goal created successfully!", { id: toastId });
          if (onSuccess) onSuccess();
          router.push('/dashboard/goals'); // Navigate to goals page
        } catch (createError) {
          console.error("Error creating goal:", createError);
          toast.error("Failed to create goal. Please try again.", { id: toastId });
        } finally {
          setIsLoading(false);
        }
      } else {
        console.error("Form data missing");
        toast.error("Form data is missing. Please try again.");
      }
    } catch (error) {
      console.error("Error in goal creation:", error);
      toast.error("Failed to create goal. Please try again.");
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
    <div className="w-full mx-auto">
      {showInsufficientBalanceAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insufficient Tokens!</AlertTitle>
          <AlertDescription>
            You don&apos;t have enough tokens to create this goal. Your balance: {balance.toFixed(1)} tokens. Cost: {adjustedCost.toFixed(1)} tokens.
            <Button variant="outline" className="mt-2" onClick={() => router.push('/dashboard/wallet?action=purchase')}>
              Add Tokens
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="create-goal-form">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter title for your goal" {...field} />
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
              name="marketplaces"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel>Marketplaces</FormLabel>
                    <FormDescription>
                      Select the marketplaces to search for deals.
                    </FormDescription>
                  </div>
                  {availableMarkets.map((market) => (
                    <FormField
                      key={market}
                      control={form.control}
                      name="marketplaces"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={market}
                            className="flex flex-row items-start space-x-3 space-y-0 mb-2"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(market)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, market])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== market
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center">
                              {marketIcons[market as keyof typeof marketIcons]}
                              {market === 'google_shopping' ? 'Google Shopping' : 
                                market.charAt(0).toUpperCase() + market.slice(1)}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                <Button type="button" onClick={addKeyword}>Add</Button>
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
                <Button type="button" onClick={addBrand}>Add</Button>
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
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority Level (Cost Multiplier)</FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Slider
                        min={1}
                        max={5}
                        step={1}
                        value={[field.value]}
                        onValueChange={(values) => field.onChange(values[0])}
                        className="w-full"
                        range={false}
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
                    Higher priority goals cost more tokens but receive faster and more accurate matches.
                    <div className="mt-1 text-sm text-white">
                      {field.value === 1 && 'Lowest cost option (20% discount)'}
                      {field.value === 2 && 'Standard cost option'}
                      {field.value === 3 && 'Premium option (20% premium)'}
                      {field.value === 4 && 'Urgent option (50% premium)'}
                      {field.value === 5 && 'Critical option (100% premium)'}
                    </div>
                    <div className="mt-2 p-2 border rounded bg-blue-950/30 text-white">
                      Selected cost: <span className="font-bold text-lg text-blue-400">{adjustedCost.toFixed(1)} tokens</span>
                    </div>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                        range={false}
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              data-testid="create-goal-button"
              disabled={isLoading}
              onClick={() => console.log("Create Goal button clicked")}
            >
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
          </div>
        </form>
      </Form>

      {/* Cost modal */}
      {showCostModal && (
        <GoalCostModal
          isOpen={showCostModal}
          onClose={() => {
            console.log("Cost modal close triggered");
            setShowCostModal(false);
          }}
          tokenCost={adjustedCost || 5}
          features={costFeatures || [
            "AI-powered goal optimization",
            "Smart progress tracking",
            "Real-time deal alerts",
            "Priority matching with new deals"
          ]}
          balance={balance}
          onConfirm={() => {
            console.log("Cost modal confirm triggered");
            // Perform a final balance check right before confirming
            walletService.getBalance().then(finalBalance => {
              // Ensure finalBalance is a number and not NaN
              const safeFinalBalance = typeof finalBalance === 'number' && !isNaN(finalBalance) ? finalBalance : 0;
              
              if (safeFinalBalance < adjustedCost) {
                // Show insufficient balance toast and don't proceed
                toast.error(`Insufficient balance: ${safeFinalBalance.toFixed(1)} tokens (need ${adjustedCost.toFixed(1)})`);
                // Update the balance state
                setBalance(safeFinalBalance);
                return;
              }
              
              // If we have sufficient balance, proceed with goal creation
              handleConfirmCreate();
            }).catch(error => {
              console.error("Error in final balance check:", error);
              // Continue with creation attempt since we can't verify balance
              toast.error("Could not verify final balance, attempting to create goal anyway");
              handleConfirmCreate();
            });
          }}
        />
      )}

      {/* Fallback modal if the main modal fails to appear */}
      {showFallbackModal && (
        <SimpleModal
          show={showFallbackModal}
          title={balance >= adjustedCost ? "Goal Cost Breakdown" : "Insufficient Tokens"}
          message={
            balance >= adjustedCost
              ? `Creating this goal will cost ${adjustedCost.toFixed(1)} tokens. Your current balance is ${balance.toFixed(1)} tokens.`
              : `You need ${Math.max(0, (adjustedCost - balance)).toFixed(1)} more tokens to create this goal. Your current balance is ${balance.toFixed(1)} tokens.`
          }
          onCancel={() => setShowFallbackModal(false)}
          onConfirm={balance >= adjustedCost ? handleConfirmCreate : () => {}}
          canConfirm={balance >= adjustedCost}
          confirmText={balance >= adjustedCost ? "Create Goal" : "Add Tokens"}
          routerPush={router.push}
        />
      )}

      {/* Add custom styles */}
      <style jsx global>{SELECT_STYLES}</style>
    </div>
  );
} 