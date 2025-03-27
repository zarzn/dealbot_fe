import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { PriceRangeSlider } from '@/components/ui/price-range-slider';
import { FiFilter, FiX } from 'react-icons/fi';

export interface DealFiltersState {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  featured?: boolean;
  verified?: boolean;
  tags?: string[];
}

interface DealFiltersProps {
  initialFilters?: DealFiltersState;
  onApplyFilters: (filters: DealFiltersState) => void;
  availableCategories?: string[];
  availableTags?: string[];
  isLoading?: boolean;
}

export const DealFilters: React.FC<DealFiltersProps> = ({
  initialFilters = {},
  onApplyFilters,
  availableCategories = ['electronics', 'clothing', 'home', 'sports', 'beauty', 'toys', 'books', 'services', 'other'],
  availableTags = [],
  isLoading = false,
}) => {
  const [filters, setFilters] = useState<DealFiltersState>({
    category: initialFilters.category || '',
    priceMin: initialFilters.priceMin || 0,
    priceMax: initialFilters.priceMax || 1000,
    sortBy: initialFilters.sortBy || 'created_at',
    sortOrder: initialFilters.sortOrder || 'desc',
    featured: initialFilters.featured || false,
    verified: initialFilters.verified || false,
    tags: initialFilters.tags || [],
  });

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on component mount and window resize
  React.useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: Number(value),
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFilters({
      ...filters,
      [name]: checked,
    });
  };

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => {
      const newTags = prev.tags?.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...(prev.tags || []), tag];
      
      return {
        ...prev,
        tags: newTags,
      };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    if (isMobile) {
      setIsFiltersOpen(false);
    }
  };

  const handleReset = () => {
    setFilters({
      category: '',
      priceMin: 0,
      priceMax: 1000,
      sortBy: 'created_at',
      sortOrder: 'desc',
      featured: false,
      verified: false,
      tags: [],
    });
  };

  const filterContent = (
    <div>
      <div className="space-y-4 divide-y divide-gray-200">
        <div className="pb-4">
          <Label className="font-bold block mb-2">Sort By</Label>
          <select 
            name="sortBy"
            value={filters.sortBy}
            onChange={handleChange}
            className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="created_at">Date Added</option>
            <option value="price">Price</option>
            <option value="title">Title</option>
            <option value="views">Popularity</option>
          </select>
          
          <div className="flex gap-2 mt-2">
            <Button 
              type="button"
              size="sm" 
              variant={filters.sortOrder === 'asc' ? 'default' : 'outline'}
              onClick={() => setFilters({...filters, sortOrder: 'asc'})}
            >
              Ascending
            </Button>
            <Button 
              type="button"
              size="sm" 
              variant={filters.sortOrder === 'desc' ? 'default' : 'outline'}
              onClick={() => setFilters({...filters, sortOrder: 'desc'})}
            >
              Descending
            </Button>
          </div>
        </div>
        
        <div className="py-4">
          <details className="group" open>
            <summary className="flex justify-between items-center font-bold cursor-pointer list-none">
              Category
              <span className="transition group-open:rotate-180">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="h-5 w-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </span>
            </summary>
            <div className="pt-4 pb-2">
              <select 
                name="category"
                value={filters.category}
                onChange={handleChange}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Categories</option>
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </details>
        </div>
        
        <div className="py-4">
          <details className="group" open>
            <summary className="flex justify-between items-center font-bold cursor-pointer list-none">
              Price Range
              <span className="transition group-open:rotate-180">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="h-5 w-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </span>
            </summary>
            <div className="pt-4 pb-2 px-2">
              <div className="flex justify-between mb-2">
                <span>${filters.priceMin}</span>
                <span>${filters.priceMax}</span>
              </div>
              
              <PriceRangeSlider
                minValue={filters.priceMin || 0}
                maxValue={filters.priceMax || 1000}
                min={0}
                max={1000}
                step={10}
                onChange={([min, max]) => {
                  setFilters({
                    ...filters,
                    priceMin: min,
                    priceMax: max
                  });
                }}
                className="mb-4"
                showLabels={false}
              />
              
              <div className="flex justify-between mt-4">
                <div className="w-[48%]">
                  <Label htmlFor="priceMin" className="text-sm">Min</Label>
                  <Input
                    id="priceMin"
                    name="priceMin"
                    type="number"
                    value={filters.priceMin}
                    onChange={handlePriceRangeChange}
                    className="mt-1"
                  />
                </div>
                <div className="w-[48%]">
                  <Label htmlFor="priceMax" className="text-sm">Max</Label>
                  <Input
                    id="priceMax"
                    name="priceMax"
                    type="number"
                    value={filters.priceMax}
                    onChange={handlePriceRangeChange}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </details>
        </div>
        
        {availableTags.length > 0 && (
          <div className="py-4">
            <details className="group">
              <summary className="flex justify-between items-center font-bold cursor-pointer list-none">
                Tags
                <span className="transition group-open:rotate-180">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    className="h-5 w-5"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M19 9l-7 7-7-7" 
                    />
                  </svg>
                </span>
              </summary>
              <div className="pt-4 pb-2 flex flex-col items-start gap-2">
                {availableTags.map((tag) => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tags?.includes(tag) || false}
                      onChange={() => handleTagToggle(tag)}
                      className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                    />
                    {tag}
                  </label>
                ))}
              </div>
            </details>
          </div>
        )}
        
        <div className="py-4">
          <details className="group">
            <summary className="flex justify-between items-center font-bold cursor-pointer list-none">
              Additional Filters
              <span className="transition group-open:rotate-180">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  className="h-5 w-5"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 9l-7 7-7-7" 
                  />
                </svg>
              </span>
            </summary>
            <div className="pt-4 pb-2 flex flex-col items-start gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={filters.featured}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                />
                Featured Deals
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="verified"
                  checked={filters.verified}
                  onChange={handleCheckboxChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
                />
                Verified Deals
              </label>
            </div>
          </details>
        </div>
      </div>
      
      <div className="flex gap-2 mt-6">
        <Button 
          type="button"
          variant="outline" 
          onClick={handleReset}
          size="sm"
          className="flex-1"
        >
          Reset
        </Button>
        <Button 
          type="button"
          onClick={handleApply}
          disabled={isLoading}
          size="sm"
          className="flex-2"
        >
          {isLoading ? 'Applying...' : 'Apply Filters'}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        <div className="flex justify-between items-center mb-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={() => setIsFiltersOpen(true)} 
            size="sm"
            className="flex items-center"
          >
            <FiFilter className="mr-2" />
            Filters & Sort
          </Button>
          
          <div className="text-sm text-gray-600">
            {filters.category ? `Category: ${filters.category}` : null}
            {filters.tags?.length ? ` • ${filters.tags.length} tags` : null}
            {filters.priceMin > 0 || filters.priceMax < 1000 ? ` • Price filtered` : null}
          </div>
        </div>
        
        {isFiltersOpen && (
          <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 p-4 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Filters</h2>
              <button
                onClick={() => setIsFiltersOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>
            
            {filterContent}
          </div>
        )}
      </>
    );
  }

  return (
    <div 
      className="p-4 border border-gray-200 rounded-md sticky top-[100px]"
    >
      <h2 className="font-bold text-lg mb-4">Filters</h2>
      {filterContent}
    </div>
  );
};

export default DealFilters; 