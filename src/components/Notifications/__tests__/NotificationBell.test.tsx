import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NotificationBell } from '../NotificationBell';
import { notificationService } from '@/services/notifications';
import { vi } from 'vitest';

// Mock the notification service
vi.mock('@/services/notifications', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markMultipleAsRead: vi.fn(),
    setupWebSocket: vi.fn()
  }
}));

const mockNotifications = [
  {
    id: '1',
    title: 'Test Notification 1',
    message: 'Test message 1',
    type: 'system',
    status: 'sent',
    created_at: new Date().toISOString(),
    read_at: null,
    action_url: null
  },
  {
    id: '2',
    title: 'Test Notification 2',
    message: 'Test message 2',
    type: 'deal_match',
    status: 'sent',
    created_at: new Date().toISOString(),
    read_at: null,
    action_url: 'http://example.com'
  }
];

describe('NotificationBell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (notificationService.getNotifications as any).mockResolvedValue(mockNotifications);
    (notificationService.setupWebSocket as any).mockImplementation((callback) => {
      // Store callback for simulating WebSocket messages
      (global as any).mockWebSocketCallback = callback;
      return () => {};
    });
  });

  it('renders notification bell with correct unread count', async () => {
    render(<NotificationBell />);

    // Wait for notifications to load
    await waitFor(() => {
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });
  });

  it('opens notification drawer on click', async () => {
    render(<NotificationBell />);

    // Click the notification bell
    const bell = screen.getByRole('button');
    fireEvent.click(bell);

    // Check if notifications are displayed
    await waitFor(() => {
      expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
      expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
    });
  });

  it('marks notification as read when clicked', async () => {
    (notificationService.markAsRead as any).mockResolvedValue({
      ...mockNotifications[0],
      read_at: new Date().toISOString()
    });

    render(<NotificationBell />);

    // Open notification drawer
    const bell = screen.getByRole('button');
    fireEvent.click(bell);

    // Click on a notification
    await waitFor(() => {
      const notification = screen.getByText('Test Notification 1');
      fireEvent.click(notification);
    });

    expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('handles mark all as read', async () => {
    (notificationService.markMultipleAsRead as any).mockResolvedValue(
      mockNotifications.map(n => ({ ...n, read_at: new Date().toISOString() }))
    );

    render(<NotificationBell />);

    // Open notification drawer
    const bell = screen.getByRole('button');
    fireEvent.click(bell);

    // Click "Mark all as read" button
    await waitFor(() => {
      const markAllButton = screen.getByText('Mark all as read');
      fireEvent.click(markAllButton);
    });

    expect(notificationService.markMultipleAsRead).toHaveBeenCalledWith(['1', '2']);
  });

  it('updates notifications in real-time via WebSocket', async () => {
    render(<NotificationBell />);

    // Wait for initial notifications to load
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Simulate receiving a new notification via WebSocket
    const newNotification = {
      id: '3',
      title: 'New Notification',
      message: 'Real-time notification',
      type: 'system',
      status: 'sent',
      created_at: new Date().toISOString(),
      read_at: null,
      action_url: null
    };

    (global as any).mockWebSocketCallback(newNotification);

    // Check if the unread count is updated
    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });
}); 