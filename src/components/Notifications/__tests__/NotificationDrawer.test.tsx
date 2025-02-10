import { render, screen, fireEvent } from '@testing-library/react';
import { NotificationDrawer } from '../NotificationDrawer';
import { vi } from 'vitest';

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
    read_at: new Date().toISOString(),
    action_url: 'http://example.com',
    data: {
      price: 99.99,
      savings_percentage: 20
    }
  }
];

describe('NotificationDrawer', () => {
  const mockOnClose = vi.fn();
  const mockOnMarkAsRead = vi.fn();
  const mockOnMarkAllAsRead = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders notifications correctly', () => {
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={mockNotifications}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    // Check if notifications are displayed
    expect(screen.getByText('Test Notification 1')).toBeInTheDocument();
    expect(screen.getByText('Test Notification 2')).toBeInTheDocument();
    expect(screen.getByText('Test message 1')).toBeInTheDocument();
    expect(screen.getByText('Test message 2')).toBeInTheDocument();
  });

  it('displays deal-specific information for deal notifications', () => {
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={mockNotifications}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    // Check if deal information is displayed
    expect(screen.getByText('Price: $99.99')).toBeInTheDocument();
    expect(screen.getByText('Save 20%')).toBeInTheDocument();
  });

  it('shows "Mark all as read" button only when there are unread notifications', () => {
    // Render with unread notifications
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={mockNotifications}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    expect(screen.getByText('Mark all as read')).toBeInTheDocument();

    // Render with all notifications read
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={mockNotifications.map(n => ({ ...n, read_at: new Date().toISOString() }))}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    expect(screen.queryByText('Mark all as read')).not.toBeInTheDocument();
  });

  it('calls onMarkAsRead when clicking a notification', () => {
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={mockNotifications}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    // Click an unread notification
    fireEvent.click(screen.getByText('Test Notification 1'));
    expect(mockOnMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('calls onMarkAllAsRead when clicking "Mark all as read"', () => {
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={mockNotifications}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    fireEvent.click(screen.getByText('Mark all as read'));
    expect(mockOnMarkAllAsRead).toHaveBeenCalled();
  });

  it('shows empty state when there are no notifications', () => {
    render(
      <NotificationDrawer
        isOpen={true}
        onClose={mockOnClose}
        notifications={[]}
        onMarkAsRead={mockOnMarkAsRead}
        onMarkAllAsRead={mockOnMarkAllAsRead}
      />
    );

    expect(screen.getByText('No notifications')).toBeInTheDocument();
  });
}); 