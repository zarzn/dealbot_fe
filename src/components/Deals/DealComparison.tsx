'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DealCard } from '@/components/Deals/DealCard';
import { Deal, DealResponse } from '@/types/deal';
import { User } from '@/types/user';
import { SearchResult } from '@/types/search';
import { extractRating } from '@/lib/utils';
import { getDeals, compareDealsByIds } from '@/services/deal';
import { adaptDealToDealCard } from '@/lib/adapters/deal';
import { AlertCircle, Check, Flag, ChevronRight, BarChart, AlertTriangle, Info, Award, DollarSign, Star, Package, ArrowDown, ArrowUp } from 'lucide-react';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Skeleton } from '@/components/ui/skeleton';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface DealComparisonProps {
  user: User;
  initialDeals?: DealResponse[];
  dealsToCompare?: string[];
  searchResult?: SearchResult;
  onClose?: () => void;
}

export function DealComparison({
  user,
  initialDeals = [],
  dealsToCompare = [],
  searchResult,
  onClose
}: DealComparisonProps) {
  // State for selected deals
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>(dealsToCompare);
  const [availableDeals, setAvailableDeals] = useState<DealResponse[]>(initialDeals);
  
  // State for comparison options
  const [comparisonType, setComparisonType] = useState<string>('overall');
  const [weights, setWeights] = useState({
    price: 40,
    features: 30,
    value: 30,
  });
  
  // State for comparison results
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load available deals if not provided
  useEffect(() => {
    const loadDeals = async () => {
      if (initialDeals.length === 0) {
        try {
          const deals = await getDeals(1, 20);
          setAvailableDeals(deals.items || []);
        } catch (err) {
          setError('Failed to load deals to compare');
          console.error('Error loading deals:', err);
        }
      }
    };
    
    loadDeals();
  }, [initialDeals]);
  
  // Auto-compare initially selected deals
  useEffect(() => {
    if (dealsToCompare.length >= 2) {
      compareSelectedDeals();
    }
  }, [dealsToCompare]);
  
  // Handle deal selection
  const toggleDealSelection = (dealId: string) => {
    setSelectedDealIds(prev => 
      prev.includes(dealId)
        ? prev.filter(id => id !== dealId)
        : [...prev, dealId]
    );
  };
  
  // Handle weight changes
  const handleWeightChange = (type: 'price' | 'features' | 'value', value: number) => {
    setWeights(prev => {
      const newWeights = { ...prev, [type]: value };
      // Normalize weights to sum to 100
      const total = Object.values(newWeights).reduce((sum, val) => sum + val, 0);
      return {
        price: Math.round((newWeights.price / total) * 100),
        features: Math.round((newWeights.features / total) * 100),
        value: Math.round((newWeights.value / total) * 100),
      };
    });
  };
  
  // Perform comparison of selected deals
  const compareSelectedDeals = async () => {
    if (selectedDealIds.length < 2) {
      setError('Please select at least two deals to compare');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await compareDealsByIds(selectedDealIds, {
        comparison_type: comparisonType,
        criteria: {
          price_weight: weights.price / 100,
          feature_weight: weights.features / 100,
          value_weight: weights.value / 100,
        },
      });
      
      setComparisonResult(result);
    } catch (err) {
      console.error('Error comparing deals:', err);
      setError('Failed to compare deals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate radar chart data for comparison
  const generateRadarChartData = () => {
    if (!comparisonResult || !comparisonResult.scores) return null;
    
    const dealIds = Object.keys(comparisonResult.scores);
    const labels = ['Price', 'Features', 'Value'];
    
    const datasets = dealIds.map((dealId, index) => {
      const deal = comparisonResult.deals.find((d: any) => String(d.id) === dealId);
      const scores = comparisonResult.scores[dealId].components;
      
      return {
        label: deal?.title || `Deal ${index + 1}`,
        data: [
          scores.price_score * 100,
          scores.feature_score * 100,
          scores.value_score * 100,
        ],
        backgroundColor: `rgba(${index * 50 + 50}, ${255 - index * 30}, ${index * 70 + 100}, 0.2)`,
        borderColor: `rgba(${index * 50 + 50}, ${255 - index * 30}, ${index * 70 + 100}, 1)`,
        borderWidth: 2,
      };
    });
    
    return {
      labels,
      datasets,
    };
  };
  
  // Render comparison results
  const renderComparisonResults = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 py-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      );
    }
    
    if (!comparisonResult) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Info size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">No Comparison Yet</h3>
          <p className="text-center text-muted-foreground max-w-md">
            Select at least two deals and click "Compare Deals" to see a detailed comparison.
          </p>
        </div>
      );
    }
    
    const radarData = generateRadarChartData();
    const bestDeal = comparisonResult.deals.find((d: any) => 
      String(d.id) === comparisonResult.best_deal_id
    );
    
    return (
      <div className="space-y-6">
        {/* Best Deal Banner */}
        {bestDeal && (
          <Alert className="bg-green-50 border-green-200">
            <Award className="h-5 w-5 text-green-600" />
            <AlertTitle className="text-green-700">Best Overall Deal</AlertTitle>
            <AlertDescription className="text-green-700">
              {bestDeal.title} is the best choice with an overall score of {Math.round(bestDeal.overall_score * 100)}%.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="mr-2 h-5 w-5" />
              Key Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {comparisonResult.insights.map((insight: string, index: number) => (
                <li key={index} className="flex items-start">
                  <ChevronRight className="h-5 w-5 mr-2 text-primary shrink-0 mt-0.5" />
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Comparison Chart */}
        {radarData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5" />
                Performance Comparison
              </CardTitle>
              <CardDescription>
                How each deal performs across key factors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full">
                <Radar 
                  data={radarData} 
                  options={{
                    scales: {
                      r: {
                        min: 0,
                        max: 100,
                        ticks: {
                          stepSize: 20,
                          callback: (value) => `${value}%`
                        }
                      }
                    },
                    plugins: {
                      tooltip: {
                        callbacks: {
                          label: (context) => {
                            return `${context.dataset.label}: ${context.raw}%`;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Detailed Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5" />
              Detailed Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Deal</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Features</TableHead>
                    <TableHead className="text-right">Value Score</TableHead>
                    <TableHead className="text-right">Overall Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonResult.deals.map((deal: any) => (
                    <TableRow key={deal.id} className={deal.id === comparisonResult.best_deal_id ? "bg-green-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {deal.id === comparisonResult.best_deal_id && (
                            <Award className="h-4 w-4 text-yellow-500 mr-1.5" />
                          )}
                          <span className="line-clamp-1">{deal.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${deal.total_price || deal.price}
                        {deal.price_difference_percent > 0 && (
                          <span className="text-red-500 ml-1 text-xs">
                            +{deal.price_difference_percent}%
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{deal.feature_count}</TableCell>
                      <TableCell className="text-right">{deal.value_score}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Progress 
                            value={deal.overall_score * 100} 
                            className="h-2 w-16 mr-2" 
                          />
                          {Math.round(deal.overall_score * 100)}%
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deal Selection */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Select Deals to Compare</CardTitle>
              <CardDescription>
                Choose at least 2 deals for comparison
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedDealIds.length} deals selected
                  </span>
                  {selectedDealIds.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDealIds([])}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {availableDeals.map((deal: DealResponse) => (
                    <div key={deal.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={`deal-${deal.id}`}
                        checked={selectedDealIds.includes(deal.id)}
                        onCheckedChange={() => toggleDealSelection(deal.id)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={`deal-${deal.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {deal.title}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${deal.price} • {deal.market_name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                disabled={selectedDealIds.length < 2 || isLoading}
                onClick={compareSelectedDeals}
              >
                {isLoading ? 'Comparing...' : 'Compare Deals'}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Right Column: Comparison Options & Results */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {/* Comparison Options */}
            <Card>
              <CardHeader>
                <CardTitle>Comparison Options</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Comparison Type */}
                  <div className="space-y-2">
                    <Label htmlFor="comparison-type">Comparison Type</Label>
                    <Select
                      value={comparisonType}
                      onValueChange={setComparisonType}
                    >
                      <SelectTrigger id="comparison-type">
                        <SelectValue placeholder="Select comparison type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="price">Price Comparison</SelectItem>
                        <SelectItem value="features">Feature Comparison</SelectItem>
                        <SelectItem value="value">Value Comparison</SelectItem>
                        <SelectItem value="overall">Overall Comparison</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Factor Weights (only for overall comparison) */}
                  {comparisonType === 'overall' && (
                    <div className="space-y-6 md:col-span-2">
                      <h4 className="text-sm font-medium mb-2">Factor Importance</h4>
                      
                      {/* Price Weight */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="price-weight">Price</Label>
                          <span className="text-sm text-muted-foreground">{weights.price}%</span>
                        </div>
                        <Slider
                          id="price-weight"
                          min={10}
                          max={80}
                          step={5}
                          value={[weights.price]}
                          onValueChange={(value) => handleWeightChange('price', value[0])}
                        />
                      </div>
                      
                      {/* Features Weight */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="features-weight">Features</Label>
                          <span className="text-sm text-muted-foreground">{weights.features}%</span>
                        </div>
                        <Slider
                          id="features-weight"
                          min={10}
                          max={80}
                          step={5}
                          value={[weights.features]}
                          onValueChange={(value) => handleWeightChange('features', value[0])}
                        />
                      </div>
                      
                      {/* Value Weight */}
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="value-weight">Value</Label>
                          <span className="text-sm text-muted-foreground">{weights.value}%</span>
                        </div>
                        <Slider
                          id="value-weight"
                          min={10}
                          max={80}
                          step={5}
                          value={[weights.value]}
                          onValueChange={(value) => handleWeightChange('value', value[0])}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Error message if any */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Comparison Results */}
            {renderComparisonResults()}
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      {onClose && (
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline" className="mr-2">
            Close Comparison
          </Button>
          {comparisonResult && (
            <Button>
              Save Comparison
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default DealComparison; 