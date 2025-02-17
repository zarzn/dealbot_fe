"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { goalsService } from '@/services/goals';
import { walletService } from '@/services/wallet';
import type { Goal } from '@/services/goals';
import GoalCostModal from '@/components/Goals/GoalCostModal';

interface PriceRange {
  min: string;
  max: string;
}

interface GoalFormData {
  title: string;
  description: string;
  category: string;
  priceRange: PriceRange;
  urgency: 'low' | 'medium' | 'high';
  notifyOn: string[];
  marketplaces: string[];
}

const categories = [
  'Electronics',
  'Gaming',
  'Home & Kitchen',
  'Fashion',
  'Books',
  'Sports & Outdoors',
  'Toys & Games',
  'Automotive',
  'Health & Beauty',
  'Other'
];

const marketplaces = [
  'Amazon',
  'Walmart',
  'eBay',
  'Best Buy',
  'Target'
];

export default function CreateGoalPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [goalCost, setGoalCost] = useState<{ tokenCost: number; features: string[] } | null>(null);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    category: '',
    priceRange: { min: '', max: '' },
    urgency: 'medium',
    notifyOn: ['significant_drop', 'target_reached'],
    marketplaces: ['Amazon', 'Walmart']
  });

  useEffect(() => {
    loadWalletBalance();
    loadGoalCost();
  }, []);

  const loadWalletBalance = async () => {
    try {
      const balance = await walletService.getBalance();
      setBalance(balance);
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
      toast.error('Failed to load wallet balance');
    }
  };

  const loadGoalCost = async () => {
    try {
      const cost = await goalsService.getGoalCost();
      setGoalCost(cost);
    } catch (error) {
      console.error('Failed to load goal cost:', error);
      toast.error('Failed to load goal cost');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalCost) {
      toast.error('Failed to get goal cost');
      return;
    }
    setShowCostModal(true);
  };

  const handleConfirmCreate = async () => {
    setIsSubmitting(true);
    try {
      // Transform form data to match API schema
      const goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title,
        itemCategory: formData.category,
        currentPrice: 0, // Will be set by backend
        targetPrice: parseFloat(formData.priceRange.min),
        priceHistory: [],
        source: formData.marketplaces[0], // Primary marketplace
        url: '', // Will be set by backend
        constraints: {
          maxPrice: parseFloat(formData.priceRange.max),
          features: [], // Can be added later
        },
        notifications: {
          email: formData.notifyOn.length > 0,
          inApp: true,
          priceThreshold: parseFloat(formData.priceRange.min),
        },
        status: 'active',
      };

      await goalsService.createGoal(goalData);
      await loadWalletBalance(); // Refresh balance after goal creation
      toast.success('Goal created successfully!');
      router.push('/dashboard/goals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
      setShowCostModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/goals"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Goal</h1>
          <p className="text-white/70">Set up a new deal-finding goal</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* Basic Information */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Goal Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Gaming Monitor Deal"
              className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what you're looking for..."
              className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple h-24 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Price Range</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Target Price ($)</label>
              <input
                type="number"
                value={formData.priceRange.min}
                onChange={(e) => setFormData({
                  ...formData,
                  priceRange: { ...formData.priceRange, min: e.target.value }
                })}
                placeholder="0"
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Maximum Price ($)</label>
              <input
                type="number"
                value={formData.priceRange.max}
                onChange={(e) => setFormData({
                  ...formData,
                  priceRange: { ...formData.priceRange, max: e.target.value }
                })}
                placeholder="1000"
                className="w-full px-4 py-2 bg-white/[0.05] border border-white/10 rounded-lg focus:outline-none focus:border-purple"
                min="0"
                required
              />
            </div>
          </div>
        </div>

        {/* Urgency */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Urgency Level</h3>
          <div className="flex gap-4">
            {['low', 'medium', 'high'].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: level as 'low' | 'medium' | 'high' })}
                className={`px-4 py-2 rounded-lg ${
                  formData.urgency === level
                    ? 'bg-purple text-white'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notifications</h3>
          <div className="space-y-2">
            {[
              { id: 'significant_drop', label: 'Significant Price Drops' },
              { id: 'target_reached', label: 'Target Price Reached' },
              { id: 'new_deal', label: 'New Deal Found' },
              { id: 'stock_alert', label: 'Back in Stock' }
            ].map(({ id, label }) => (
              <label key={id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.notifyOn.includes(id)}
                  onChange={(e) => {
                    const newNotifyOn = e.target.checked
                      ? [...formData.notifyOn, id]
                      : formData.notifyOn.filter(item => item !== id);
                    setFormData({ ...formData, notifyOn: newNotifyOn });
                  }}
                  className="w-4 h-4 rounded border-white/10 bg-white/[0.05]"
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Marketplaces */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Marketplaces</h3>
          <div className="flex flex-wrap gap-2">
            {marketplaces.map((marketplace) => (
              <button
                key={marketplace}
                type="button"
                onClick={() => {
                  const newMarketplaces = formData.marketplaces.includes(marketplace)
                    ? formData.marketplaces.filter(m => m !== marketplace)
                    : [...formData.marketplaces, marketplace];
                  setFormData({ ...formData, marketplaces: newMarketplaces });
                }}
                className={`px-4 py-2 rounded-lg ${
                  formData.marketplaces.includes(marketplace)
                    ? 'bg-purple text-white'
                    : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
                }`}
              >
                {marketplace}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Creating...' : 'Create Goal'}
          </button>
          <Link
            href="/dashboard/goals"
            className="px-6 py-2 bg-white/[0.05] rounded-lg hover:bg-white/[0.1] transition"
          >
            Cancel
          </Link>
        </div>
      </form>

      {/* Token Cost Modal */}
      {goalCost && (
        <GoalCostModal
          isOpen={showCostModal}
          onClose={() => setShowCostModal(false)}
          onConfirm={handleConfirmCreate}
          cost={goalCost}
          balance={balance}
        />
      )}
    </div>
  );
} 