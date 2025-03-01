'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { NotificationPreferences, notificationService } from '@/services/notifications';

const formSchema = z.object({
  enabled_channels: z.array(z.string()),
  email_digest: z.boolean(),
  push_enabled: z.boolean(),
  do_not_disturb: z.boolean(),
  notification_frequency: z.record(z.string(), z.string()),
  time_windows: z.record(z.string(), z.object({
    start_time: z.string(),
    end_time: z.string(),
    timezone: z.string()
  }))
});

export default function NotificationPreferencesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      enabled_channels: [],
      email_digest: true,
      push_enabled: true,
      do_not_disturb: false,
      notification_frequency: {},
      time_windows: {}
    }
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const preferences = await notificationService.getPreferences();
      form.reset(preferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      // Ensure all time_windows have required properties
      const timeWindows: Record<string, { start_time: string; end_time: string; timezone: string }> = {};
      
      Object.entries(values.time_windows || {}).forEach(([key, window]) => {
        timeWindows[key] = {
          start_time: window.start_time || '09:00',
          end_time: window.end_time || '17:00',
          timezone: window.timezone || 'UTC'
        };
      });
      
      // Create a properly typed preferences object
      const preferences: Partial<NotificationPreferences> = {
        ...values,
        time_windows: timeWindows
      };
      
      await notificationService.updatePreferences(preferences);
      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully'
      });
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>
            Customize how and when you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email_digest"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="push_enabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Push Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications in your browser
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="do_not_disturb"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Do Not Disturb</FormLabel>
                      <FormDescription>
                        Temporarily pause all notifications
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Notification frequency settings for each type */}
              {Object.entries(form.getValues('notification_frequency')).map(([type, frequency]) => (
                <FormField
                  key={type}
                  control={form.control}
                  name={`notification_frequency.${type}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2 block">
                        {type.replace('_', ' ')} Notifications
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Real-time</SelectItem>
                            <SelectItem value="hourly">Hourly</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
} 