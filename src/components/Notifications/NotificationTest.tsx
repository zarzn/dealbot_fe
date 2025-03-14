import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { notificationService } from '@/services/notifications';
import { toast } from 'sonner';

export function NotificationTest() {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system',
  });
  const [isSending, setIsSending] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real app, this would call an API endpoint to create a notification
      // For testing, we'll assume there's a test notification method
      // in the notification service that simulates receiving a new notification
      
      // This is a mock call - in a real app, you'd have an API endpoint for this
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast.success('Test notification sent successfully');
      
      // Simulate receiving a notification via WebSocket
      const testNotification = {
        id: `test-${Date.now()}`,
        user_id: 'current-user',
        title: formData.title,
        message: formData.message,
        type: formData.type,
        status: 'pending',
        created_at: new Date().toISOString(),
        priority: 'medium',
        channels: ['in_app'],
      };
      
      // Manually trigger the notification handler in the NotificationCenter
      const event = new MessageEvent('message', {
        data: JSON.stringify({
          type: 'notification',
          notification: testNotification
        })
      });
      
      // You'd need to set up a way to dispatch this to the WebSocket handlers
      // For testing, we can display the notification directly
      toast.message(testNotification.title, {
        description: testNotification.message,
      });
      
      // Reset form
      setFormData({
        title: '',
        message: '',
        type: 'system',
      });
      
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Test Notification</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Notification title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="message">Message <span className="text-red-500">*</span></Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Notification message"
              rows={3}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="system">System</option>
              <option value="deal">Deal</option>
              <option value="price_alert">Price Alert</option>
              <option value="goal">Goal</option>
              <option value="security">Security</option>
              <option value="token">Token</option>
              <option value="market">Market</option>
            </select>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send Test Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default NotificationTest; 