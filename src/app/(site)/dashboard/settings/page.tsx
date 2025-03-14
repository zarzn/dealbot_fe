"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { userService, UserProfile, UserSettings, UpdateProfileRequest, UpdateSettingsRequest } from "@/services/users";
import { toast } from "sonner";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user profile
        const profile = await userService.getProfile();
        setProfileData(profile);
        
        // Fetch user settings
        const userSettings = await userService.getSettings();
        setSettings(userSettings);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserData();
  }, []);
  
  const handleUpdateProfile = async () => {
    if (!profileData) return;
    
    try {
      setIsSaving(true);
      
      const updatedData: UpdateProfileRequest = {
        name: profileData.name,
        email: profileData.email,
        // Add other fields as needed
      };
      
      // Update profile
      const result = await userService.updateProfile(updatedData);
      
      // Update local state
      setProfileData(result);
      
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateSettings = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      const updatedSettings: UpdateSettingsRequest = {
        email_notifications: settings.email_notifications,
        theme: settings.theme,
        notification_preferences: settings.notification_preferences,
      };
      
      // Update settings
      const result = await userService.updateSettings(updatedSettings);
      
      // Update local state
      setSettings(result);
      
      toast.success("Settings updated successfully!");
    } catch (err) {
      console.error("Error updating settings:", err);
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-white/5 rounded-md w-full max-w-xs"></div>
          <div className="grid gap-4">
            <div className="h-24 bg-white/5 rounded-lg"></div>
            <div className="h-48 bg-white/5 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <div className="bg-red-900/20 border border-red-500 text-red-200 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">Display Name</label>
                  <input
                    id="name"
                    type="text"
                    className="w-full p-2 rounded-md bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                    value={profileData?.name || ''}
                    onChange={(e) => setProfileData(prev => prev ? { ...prev, name: e.target.value } : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">Email</label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 rounded-md bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                    value={profileData?.email || ''}
                    disabled
                  />
                  <p className="text-xs text-white/60">Your email cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">Bio</label>
                  <textarea
                    id="bio"
                    rows={4}
                    className="w-full p-2 rounded-md bg-white/5 border border-white/10 focus:border-primary focus:outline-none"
                    placeholder="Tell us about yourself"
                    value={''}
                    onChange={(e) => {
                      // Since bio is not in the UserProfile interface, we don't update it
                      // This is just a placeholder until the backend supports bio
                    }}
                  ></textarea>
                  <p className="text-xs text-white/60">This feature is coming soon.</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <button
                onClick={handleUpdateProfile}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-white/60">Receive email notifications for important updates</p>
                </div>
                <Switch 
                  checked={settings?.email_notifications || false}
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? { 
                      ...prev, 
                      email_notifications: checked 
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Deal Updates</p>
                  <p className="text-sm text-white/60">Get notified when deals are updated</p>
                </div>
                <Switch 
                  checked={settings?.notification_preferences?.deals || false}
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? { 
                      ...prev, 
                      notification_preferences: { 
                        ...prev.notification_preferences, 
                        deals: checked 
                      } 
                    } : null)
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">System Notifications</p>
                  <p className="text-sm text-white/60">Receive system notifications and updates</p>
                </div>
                <Switch 
                  checked={settings?.notification_preferences?.system || false}
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? { 
                      ...prev, 
                      notification_preferences: { 
                        ...prev.notification_preferences, 
                        system: checked 
                      } 
                    } : null)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <button
                onClick={handleUpdateSettings}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-white/60">Use dark theme throughout the application</p>
                </div>
                <Switch 
                  checked={settings?.theme === 'dark'}
                  onCheckedChange={(checked) => 
                    setSettings(prev => prev ? { 
                      ...prev, 
                      theme: checked ? 'dark' : 'light' 
                    } : null)
                  }
                />
              </div>
            </CardContent>
            <CardFooter>
              <button
                onClick={handleUpdateSettings}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-white/60">Add an extra layer of security to your account</p>
                </div>
                <Switch 
                  checked={false}
                  disabled={true}
                />
              </div>
              <div className="pt-4">
                <button className="px-4 py-2 bg-white/10 text-white rounded-md hover:bg-white/20 transition-colors">
                  Change Password
                </button>
              </div>
              <p className="text-sm text-white/60 mt-2">
                Note: Two-factor authentication and password change functionality will be available soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 