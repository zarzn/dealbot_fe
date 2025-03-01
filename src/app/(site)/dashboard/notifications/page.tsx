"use client"

import { useState, useEffect } from 'react';
import { Bell, Search, Filter, Check, AlertCircle, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { notificationService } from '@/services/notifications';
import type { Notification } from '@/types/api';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from '@/lib/date-utils';
import Link from 'next/link';

type FilterOption = 'all' | 'unread' | 'read';
type SortOption = 'newest' | 'oldest';
type TypeFilter = 'all' | 'price_drop' | 'goal_completed' | 'system';

// Mockup data
const mockNotifications: Notification[] = [
  {
    id: '1',
    user_id: 'user123',
    goal_id: 'goal1',
    deal_id: 'deal1',
    title: 'Price Drop Alert!',
    message: 'The LG 27" UltraGear Monitor you\'re tracking has dropped by 25% to $299.99',
    type: 'price_alert',
    priority: 'high',
    status: 'pending',
    channels: ['email', 'in_app'],
    action_url: '/dashboard/deals/1',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
  },
  {
    id: '2',
    user_id: 'user123',
    goal_id: 'goal2',
    title: 'Goal Completed!',
    message: 'Your goal "Gaming Setup Upgrade" has been completed successfully',
    type: 'goal',
    priority: 'medium',
    status: 'pending',
    channels: ['in_app'],
    action_url: '/dashboard/goals/2',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: '3',
    user_id: 'user123',
    title: 'Token Balance Low',
    message: 'Your token balance is running low. Consider adding more tokens to continue using all features.',
    type: 'token',
    priority: 'medium',
    status: 'pending',
    channels: ['email', 'in_app'],
    action_url: '/dashboard/wallet?action=add-tokens',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
  },
  {
    id: '4',
    user_id: 'user123',
    title: 'New Deal Found!',
    message: 'We found a new deal matching your "Gaming Peripherals" goal: Logitech G Pro X Superlight',
    type: 'deal',
    priority: 'high',
    status: 'read',
    channels: ['in_app'],
    action_url: '/dashboard/deals/4',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: '5',
    user_id: 'user123',
    title: 'Achievement Unlocked!',
    message: 'You\'ve earned the "Deal Hunter" badge for finding 10 great deals!',
    type: 'system',
    priority: 'low',
    status: 'read',
    channels: ['in_app'],
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
  },
  {
    id: '6',
    user_id: 'user123',
    title: 'Market Analysis Complete',
    message: 'Your requested market analysis for "Gaming Laptops" is now ready.',
    type: 'market',
    priority: 'medium',
    status: 'read',
    channels: ['in_app'],
    action_url: '/dashboard/market-analysis/1',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
  },
  {
    id: '7',
    user_id: 'user123',
    title: 'Security Alert',
    message: 'New login detected from a new device. If this wasn\'t you, please secure your account.',
    type: 'security',
    priority: 'urgent',
    status: 'read',
    channels: ['email', 'in_app'],
    action_url: '/dashboard/settings/security',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(), // 4 days ago
  }
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterOption>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { notifications: data } = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, status: 'read' }))
      );
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, status: 'read' } : n))
      );
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'price_drop':
        return <AlertCircle className="h-5 w-5 text-green-500" />;
      case 'goal_completed':
        return <Check className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications
    .filter(notification => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'unread' && notification.status !== 'pending') return false;
        if (filterStatus === 'read' && notification.status === 'pending') return false;
      }

      // Type filter
      if (typeFilter !== 'all' && notification.type !== typeFilter) return false;

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          notification.title.toLowerCase().includes(query) ||
          notification.message.toLowerCase().includes(query)
        );
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">View and manage your notifications</p>
        </div>
        <Button onClick={markAllAsRead} variant="secondary" size="sm">
          Mark All as Read
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 bg-transparent border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Status</DropdownMenuLabel>
              {[
                { value: 'all', label: 'All' },
                { value: 'unread', label: 'Unread' },
                { value: 'read', label: 'Read' },
              ].map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setFilterStatus(value as FilterOption)}
                  className="flex items-center justify-between"
                >
                  <span>{label}</span>
                  {filterStatus === value && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Type</DropdownMenuLabel>
              {[
                { value: 'all', label: 'All Types' },
                { value: 'price_drop', label: 'Price Drops' },
                { value: 'goal_completed', label: 'Goal Updates' },
                { value: 'system', label: 'System' },
              ].map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setTypeFilter(value as TypeFilter)}
                  className="flex items-center justify-between"
                >
                  <span>{label}</span>
                  {typeFilter === value && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Sort</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
              ].map(({ value, label }) => (
                <DropdownMenuItem
                  key={value}
                  onClick={() => setSortBy(value as SortOption)}
                  className="flex items-center justify-between"
                >
                  <span>{label}</span>
                  {sortBy === value && <Check className="w-4 h-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Notifications List */}
      <ScrollArea className="flex-1 -mx-4 px-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-white/[0.05] rounded-lg p-4 animate-pulse"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-white/10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-white/10 rounded w-3/4" />
                    <div className="h-3 bg-white/10 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Bell className="w-12 h-12 mb-4 text-white/20" />
            <p className="text-lg font-medium text-white">No notifications found</p>
            <p className="text-white/70">
              {searchQuery || filterStatus !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                  notification.status === 'pending'
                    ? 'bg-white/[0.08] hover:bg-white/[0.12]'
                    : 'bg-white/[0.04] hover:bg-white/[0.08]'
                } cursor-pointer border border-white/[0.05]`}
                onClick={() => notification.status === 'pending' && markAsRead(notification.id)}
              >
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-white">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-white/80 mt-1">
                        {notification.message}
                      </p>
                    </div>
                    {notification.status === 'pending' && (
                      <div className="h-2 w-2 rounded-full bg-purple mt-2 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <p className="text-xs text-white/50">
                      {formatDistanceToNow(notification.created_at)}
                    </p>
                    {notification.action_url && (
                      <Link 
                        href={notification.action_url}
                        className="text-xs text-purple hover:text-purple/80 transition"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View Details
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}