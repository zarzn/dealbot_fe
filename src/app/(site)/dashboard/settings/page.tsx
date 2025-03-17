"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  User, 
  Bell, 
  Palette, 
  Shield, 
  LoaderCircle, 
  CheckCircle2, 
  Mail, 
  Smartphone, 
  Globe, 
  Clock,
  Loader2
} from "lucide-react";
import { userService, UserProfile, UserSettings, NotificationPreferences } from "@/services/users";
import { authService } from "@/services/auth";
import { PasswordChangeDialog } from "@/components/dialogs/PasswordChangeDialog";

// Helper for tab navigation
type TabType = "profile" | "notifications" | "language" | "security";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [notificationSettings, setNotificationSettings] = useState<NotificationPreferences | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [saveSuccess, setSaveSuccess] = useState<{ [key in TabType]?: boolean }>({});
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  // Fetch user data on component mount
  useEffect(() => {
    console.log('DEBUG: Settings page useEffect running');
    
    // Check localStorage first for verified status
    const checkLocalStorage = () => {
      if (typeof window !== 'undefined') {
        const verified = localStorage.getItem('email_verified') === 'true';
        console.log('DEBUG: Email verified status from localStorage:', verified);
        if (verified && profileData && !profileData.email_verified) {
          console.log('DEBUG: Updating profile from localStorage verified state');
          setProfileData({
            ...profileData,
            email_verified: true
          });
        }
      }
    };
    
    fetchUserData();
    checkLocalStorage();
    
    // Set up interval to refresh profile data every 30 seconds
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        console.log('DEBUG: Running interval refresh for profile data');
        refreshProfileData().then(() => checkLocalStorage());
      }
    }, 30000);

    // Refresh profile data when the window gets focus
    const handleFocus = () => {
      console.log('DEBUG: Window focus detected, refreshing profile data');
      refreshProfileData().then(() => checkLocalStorage());
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Clean up
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  async function fetchUserData() {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch user profile data
      const profile = await userService.getProfile();
      console.log('DEBUG: Received profile data from API:', profile);
      console.log('DEBUG: Email verification status:', profile.email_verified);
      
      // Check if we have localStorage overriding verification status
      if (typeof window !== 'undefined' && localStorage.getItem('email_verified') === 'true') {
        console.log('DEBUG: Overriding profile data with verified status from localStorage');
        profile.email_verified = true;
      }
      
      setProfileData(profile);
      
      // Fetch user settings
      const userSettings = await userService.getSettings();
      console.log('DEBUG: Received settings data from API:', userSettings);
      setSettings(userSettings);
      
      // Extract notification preferences for easier handling in the UI
      const notificationPrefs = mapSettingsToNotificationPreferences(userSettings);
      setNotificationSettings(notificationPrefs);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load profile data');
      setIsLoading(false);
    }
  }
  
  // Function to refresh only the profile data, with emphasis on verification status
  async function refreshProfileData() {
    console.log('DEBUG: refreshProfileData called');
    
    try {
      // Check if we've already confirmed the email is verified through the verification endpoint
      const emailAlreadyVerified = typeof window !== 'undefined' && localStorage.getItem('email_verified') === 'true';
      
      // Fetch user profile data 
      const profile = await userService.getProfile();
      console.log('DEBUG: Profile refresh - received data:', profile);
      console.log('DEBUG: Profile refresh - email_verified status:', profile.email_verified);
      console.log('DEBUG: Profile refresh - type of email_verified:', typeof profile.email_verified);
      
      // If the backend is inconsistent but we know the email is verified, override the response
      if (emailAlreadyVerified && !profile.email_verified) {
        console.log('DEBUG: Overriding inconsistent backend data - email is known to be verified');
        profile.email_verified = true;
      }
      
      // Update state with fresh data
      setProfileData(profile);
      
      // Return the refreshed profile
      return profile;
    } catch (err) {
      console.error('Error refreshing profile data:', err);
      return null;
    }
  }
  
  // Handle profile updates
  const handleUpdateProfile = async () => {
    if (!profileData) return;
    
    try {
      setIsSaving(true);
      
      const updatedData = {
        name: profileData.name
      };
      
      // Update profile
      const result = await userService.updateProfile(updatedData);
      
      // Update local state
      setProfileData(result);
      
      // Show success
      toast.success("Profile updated successfully");
      setSaveSuccess({ ...saveSuccess, profile: true });
      
      // Reset success indicator after 3 seconds
      setTimeout(() => {
        setSaveSuccess(prev => ({ ...prev, profile: false }));
      }, 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle notification settings updates
  const handleUpdateNotifications = async () => {
    if (!settings || !notificationSettings) {
      toast.error("No settings to update");
      return;
    }
    
    try {
      setIsSaving(true);
      setSaveSuccess({...saveSuccess, notifications: false});
      
      // Map notification preferences back to API format
      const updatedSettings = {
        ...settings,
        enabled_channels: [
          ...(notificationSettings.email_alerts ? ['email'] : []),
          ...(notificationSettings.browser_alerts ? ['in_app'] : [])
        ],
        sms_enabled: notificationSettings.sms_alerts,
        email_digest: notificationSettings.daily_digest,
        // Update notification frequency
        notification_frequency: {
          ...settings.notification_frequency,
          price_alert: notificationSettings.price_drop_alerts ? 'immediate' : 'off',
          deal: notificationSettings.deal_expiration_alerts ? 'immediate' : 'off',
          token: notificationSettings.token_alerts ? 'immediate' : 'off',
          market: notificationSettings.weekly_summary ? 'weekly' : 'off'
        }
      };
      
      console.log('Sending updated settings to API:', JSON.stringify(updatedSettings, null, 2));
      
      // Call API to update settings
      const result = await userService.updateSettings(updatedSettings);
      console.log('Settings updated successfully:', JSON.stringify(result, null, 2));
      
      // Update local state with the response
      setSettings(result);
      
      // Update notification preferences mapping
      const updatedNotificationPreferences = mapSettingsToNotificationPreferences(result);
      setNotificationSettings(updatedNotificationPreferences);
      
      toast.success("Notification preferences updated successfully");
      setSaveSuccess({...saveSuccess, notifications: true});
    } catch (err: any) {
      console.error("Error updating notification settings:", err);
      toast.error(err.message || "Failed to update notification preferences");
      setSaveSuccess({...saveSuccess, notifications: false});
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle language settings updates
  const handleUpdateLanguage = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      
      const updatedSettings = {
        language: settings.language
      };
      
      console.log('Updating language settings with:', JSON.stringify(updatedSettings, null, 2));
      
      // Update settings
      const result = await userService.updateSettings(updatedSettings);
      
      console.log('API Response for language update:', JSON.stringify(result, null, 2));
      
      // Map the response back to our frontend format
      const updatedNotificationPreferences = {
        email_alerts: result.enabled_channels?.includes('email') || false,
        browser_alerts: result.enabled_channels?.includes('in_app') || false,
        sms_alerts: result.sms_enabled || false,
        price_drop_alerts: result.notification_frequency?.price_alert && 
          (typeof result.notification_frequency.price_alert === 'string' ? 
            result.notification_frequency.price_alert === 'immediate' : 
            result.notification_frequency.price_alert.frequency === 'immediate') || false,
        deal_expiration_alerts: result.notification_frequency?.deal && 
          (typeof result.notification_frequency.deal === 'string' ? 
            result.notification_frequency.deal === 'immediate' : 
            result.notification_frequency.deal.frequency === 'immediate') || false,
        token_alerts: result.notification_frequency?.token && 
          (typeof result.notification_frequency.token === 'string' ? 
            result.notification_frequency.token === 'immediate' : 
            result.notification_frequency.token.frequency === 'immediate') || false,
        daily_digest: result.email_digest || false,
        weekly_summary: result.notification_frequency?.market && 
          (typeof result.notification_frequency.market === 'string' ? 
            result.notification_frequency.market === 'weekly' : 
            result.notification_frequency.market.frequency === 'weekly') || false
      };
      
      console.log('Mapped notification preferences after language update:', JSON.stringify(updatedNotificationPreferences, null, 2));
      
      // Update local state
      setSettings(prevSettings => {
        const newSettings = { 
          ...result, 
          notification_preferences: updatedNotificationPreferences 
        };
        console.log('Updated settings state after language update:', JSON.stringify(newSettings, null, 2));
        return newSettings;
      });
      
      // Show success
      toast.success("Language settings updated successfully");
      setSaveSuccess({ ...saveSuccess, language: true });
      
      // Reset success indicator
      setTimeout(() => {
        setSaveSuccess(prev => ({ ...prev, language: false }));
      }, 3000);
    } catch (err) {
      console.error("Error updating language settings:", err);
      toast.error("Failed to update language settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Toggle notification setting
  const toggleNotificationSetting = (key: keyof NotificationPreferences, value: boolean) => {
    console.log(`Toggling ${key} to ${value}`);
    
    if (!notificationSettings) {
      console.error('No notification settings to toggle');
      return;
    }
    
    const newSettings = {
      ...notificationSettings,
      [key]: value
    };
    
    console.log('New notification settings state:', newSettings);
    setNotificationSettings(newSettings);
  };
  
  // Change language setting
  const changeLanguage = (language: string) => {
    if (!settings) return;
    
    console.log(`Changing language to: ${language}`);
    console.log('Current language:', settings.language);
    
    setSettings(prevSettings => {
      if (!prevSettings) return prevSettings;
      
      const updatedSettings = {
        ...prevSettings,
        language,
      };
      
      console.log('Updated settings with new language:', updatedSettings);
      return updatedSettings;
    });
  };
  
  // Handle email verification request
  const handleVerifyEmail = async () => {
    if (!profileData) return;
    
    // Check if email is already verified
    console.log('DEBUG: handleVerifyEmail - current verification status:', profileData.email_verified);
    
    // Force cast to boolean
    const isVerified = Boolean(profileData.email_verified);
    
    if (isVerified) {
      console.log('DEBUG: Email is already verified, showing toast');
      toast.success("Your email is already verified!");
      // Set the localStorage flag to remember verification status
      if (typeof window !== 'undefined') {
        localStorage.setItem('email_verified', 'true');
      }
      return;
    }
    
    setIsVerifying(true);
    try {
      console.log('DEBUG: Sending verification email request');
      await authService.sendVerificationEmail();
      console.log('DEBUG: Verification email sent successfully');
      toast.success("Verification email sent! Please check your inbox and spam folders.");
      
      // Refresh profile data immediately after sending verification email
      await refreshProfileData();
    } catch (error: any) {
      console.error('Error in handleVerifyEmail:', error);
      console.log('DEBUG: Error code:', error.code);
      console.log('DEBUG: Error message:', error.message);
      
      // Special handling for already verified email scenario
      if (error.code === 'EMAIL_ALREADY_VERIFIED') {
        console.log('DEBUG: Handling EMAIL_ALREADY_VERIFIED error');
        toast.success("Your email is already verified!");
        
        // Update local state immediately
        if (profileData) {
          console.log('DEBUG: Updating local state to show email as verified');
          setProfileData({
            ...profileData,
            email_verified: true
          });
          
          // Set the localStorage flag to remember verification status
          if (typeof window !== 'undefined') {
            localStorage.setItem('email_verified', 'true');
          }
        }
        
        // Refresh from server to ensure we have the latest data
        await refreshProfileData();
      } else {
        toast.error(error.message || "Failed to send verification email");
      }
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle sign out from all devices
  const signOutAllDevices = async () => {
    try {
      // Ask for confirmation
      if (!confirm("Are you sure you want to sign out from all devices? You will be logged out of this session too.")) {
        return;
      }
      
      setIsSigningOut(true);
      
      // Call the API to sign out from all devices
      await authService.signOutAllDevices();
      
      // Show success message
      toast.success("Successfully signed out from all devices. Please log in again.");
      
      // Clear local tokens
      authService.clearTokens();
      
      // Redirect to login page
      window.location.href = "/auth/login";
    } catch (err: any) {
      console.error("Error signing out from all devices:", err);
      toast.error(err.message || "Failed to sign out from all devices. Please try again.");
      setIsSigningOut(false);
    }
  };
  
  // Helper function to map backend settings to frontend notification preferences
  const mapSettingsToNotificationPreferences = (userSettings: UserSettings): NotificationPreferences => {
    return {
      email_alerts: userSettings.enabled_channels?.includes('email') || false,
      browser_alerts: userSettings.enabled_channels?.includes('in_app') || false,
      sms_alerts: userSettings.sms_enabled || false,
      // Check if notification_frequency has objects with type and frequency or direct string values
      price_drop_alerts: userSettings.notification_frequency?.price_alert && 
        (typeof userSettings.notification_frequency.price_alert === 'string' ? 
          userSettings.notification_frequency.price_alert === 'immediate' : 
          userSettings.notification_frequency.price_alert.frequency === 'immediate') || false,
      deal_expiration_alerts: userSettings.notification_frequency?.deal && 
        (typeof userSettings.notification_frequency.deal === 'string' ? 
          userSettings.notification_frequency.deal === 'immediate' : 
          userSettings.notification_frequency.deal.frequency === 'immediate') || false,
      token_alerts: userSettings.notification_frequency?.token && 
        (typeof userSettings.notification_frequency.token === 'string' ? 
          userSettings.notification_frequency.token === 'immediate' : 
          userSettings.notification_frequency.token.frequency === 'immediate') || false,
      daily_digest: userSettings.email_digest || false,
      weekly_summary: userSettings.notification_frequency?.market && 
        (typeof userSettings.notification_frequency.market === 'string' ? 
          userSettings.notification_frequency.market === 'weekly' : 
          userSettings.notification_frequency.market.frequency === 'weekly') || false
    };
  };
  
  // Update the email verification message component to be clearer
  const renderEmailVerificationStatus = () => {
    if (!profileData) return null;
    
    console.log('DEBUG: renderEmailVerificationStatus called with profileData:', profileData);
    console.log('DEBUG: Email verification status in render function:', profileData.email_verified);
    console.log('DEBUG: Type of email_verified:', typeof profileData.email_verified);
    
    // Check localStorage for verified status
    const localStorageVerified = typeof window !== 'undefined' && localStorage.getItem('email_verified') === 'true';
    
    // Force cast to boolean to ensure proper comparison and also check localStorage
    const isVerified = Boolean(profileData.email_verified) || localStorageVerified;
    console.log('DEBUG: isVerified after Boolean conversion and localStorage check:', isVerified);
    
    if (isVerified && !profileData.email_verified) {
      console.log('DEBUG: Overriding profile data verified status based on localStorage');
      // Update the profile data to reflect the verified status for consistency
      setProfileData(prev => {
        if (prev) {
          return { ...prev, email_verified: true };
        }
        return prev;
      });
    }
    
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold text-white">Email Verification</h3>
              {isVerified && (
                <div className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">Verified</div>
              )}
            </div>
            <p className="text-sm text-gray-400">
              {isVerified 
                ? 'Your email has been verified.'
                : 'Your email is not verified. Please verify your email for full account access.'}
            </p>
          </div>
          {!isVerified && (
            <Button 
              className="min-w-[120px]"
              onClick={handleVerifyEmail}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          )}
        </div>
        {!isVerified && (
          <p className="text-xs text-gray-500">
            After clicking &quot;Verify Email&quot;, check your inbox and spam folders for the verification link.
          </p>
        )}
      </div>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <LoaderCircle className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center text-center p-4 space-y-4">
              <p className="text-destructive">{error}</p>
              <Button onClick={fetchUserData} variant="outline">
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-white/70 mt-1">Manage your account preferences</p>
      </div>
      
      <div className="mt-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
          <TabsList className="mb-6 bg-background/10 p-1 rounded-lg w-full md:w-auto">
            <TabsTrigger value="profile" className="rounded-md">
              <User className="w-4 h-4 mr-2" />Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-md">
              <Bell className="w-4 h-4 mr-2" />Notifications
            </TabsTrigger>
            <TabsTrigger value="language" className="rounded-md">
              <Globe className="w-4 h-4 mr-2" />Language
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-md">
              <Shield className="w-4 h-4 mr-2" />Security
            </TabsTrigger>
          </TabsList>
        
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-4">
            <Card className="bg-white/[0.05] backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-white">Display Name</Label>
                  <input
                    id="displayName"
                    type="text"
                    className="w-full p-2 rounded-md bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-white placeholder:text-white/70"
                    value={profileData?.name || ''}
                    onChange={(e) => setProfileData(prev => prev ? { ...prev, name: e.target.value } : null)}
                    placeholder="Your display name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 rounded-md bg-white/5 border border-white/10 opacity-70 cursor-not-allowed text-white"
                    value={profileData?.email || ''}
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">Your email address cannot be changed</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="text-sm text-white/70 mb-1">Account Type</h3>
                    <p className="text-lg font-medium text-white">{profileData?.subscription_tier || 'Free'}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="text-sm text-white/70 mb-1">Token Balance</h3>
                    <p className="text-lg font-medium text-white">{profileData?.token_balance ? profileData.token_balance.toFixed(1) : '0.0'} tokens</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                    <h3 className="text-sm text-white/70 mb-1">Since</h3>
                    <p className="text-lg font-medium text-white">{new Date(profileData?.created_at || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-white/10 pt-6">
                <Button 
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                >
                  {isSaving && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                  {saveSuccess.profile ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Saved
                    </span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        
          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-white/[0.05] backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Notification Channels</CardTitle>
                <CardDescription className="text-white/70">
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-alerts" className="text-sm text-white">Email Alerts</Label>
                  <Switch 
                    id="email-alerts" 
                    checked={notificationSettings?.email_alerts || false}
                    onCheckedChange={(checked) => toggleNotificationSetting('email_alerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="browser-alerts" className="text-sm text-white">Browser Notifications</Label>
                  <Switch 
                    id="browser-alerts"
                    checked={notificationSettings?.browser_alerts || false}
                    onCheckedChange={(checked) => toggleNotificationSetting('browser_alerts', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-alerts" className="text-sm text-white">SMS Notifications</Label>
                  <Switch 
                    id="sms-alerts"
                    checked={notificationSettings?.sms_alerts || false}
                    onCheckedChange={(checked) => toggleNotificationSetting('sms_alerts', checked)}
                  />
                </div>
              </CardContent>
              <CardHeader className="pb-0 pt-2">
                <CardTitle className="text-white">Notification Types</CardTitle>
                <CardDescription className="text-white/70">
                  Select which alerts you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="mt-6 mb-2">
                  <h4 className="font-medium text-white">Alert Types</h4>
                  <p className="text-sm text-white/70 mb-4">Choose which alerts you want to receive</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="price-drop-alerts" className="text-sm text-white">Price Drop Alerts</Label>
                      <Switch 
                        id="price-drop-alerts"
                        checked={notificationSettings?.price_drop_alerts || false}
                        onCheckedChange={(checked) => toggleNotificationSetting('price_drop_alerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="deal-expiration-alerts" className="text-sm text-white">Deal Expiration Alerts</Label>
                      <Switch 
                        id="deal-expiration-alerts"
                        checked={notificationSettings?.deal_expiration_alerts || false}
                        onCheckedChange={(checked) => toggleNotificationSetting('deal_expiration_alerts', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="token-alerts" className="text-sm text-white">Token Balance Alerts</Label>
                      <Switch 
                        id="token-alerts"
                        checked={notificationSettings?.token_alerts || false}
                        onCheckedChange={(checked) => toggleNotificationSetting('token_alerts', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Digest Preferences */}
                <div className="mt-6 mb-2">
                  <h4 className="font-medium text-white">Digest Preferences</h4>
                  <p className="text-sm text-white/70 mb-4">Configure scheduled summaries</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="daily-digest" className="text-sm text-white">Daily Digest</Label>
                      <Switch 
                        id="daily-digest"
                        checked={notificationSettings?.daily_digest || false}
                        onCheckedChange={(checked) => toggleNotificationSetting('daily_digest', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="weekly-summary" className="text-sm text-white">Weekly Market Summary</Label>
                      <Switch 
                        id="weekly-summary"
                        checked={notificationSettings?.weekly_summary || false}
                        onCheckedChange={(checked) => toggleNotificationSetting('weekly_summary', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-white/10 pt-6">
                <Button 
                  onClick={handleUpdateNotifications} 
                  disabled={isSaving}
                >
                  {isSaving && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                  {saveSuccess.notifications ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Saved
                    </span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        
          {/* Language Settings */}
          <TabsContent value="language" className="space-y-4">
            <Card className="bg-white/[0.05] backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Language Settings</CardTitle>
                <CardDescription className="text-white/70">
                  Choose your preferred language
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-white">Language</Label>
                  <select
                    id="language"
                    className="w-full p-2 rounded-md bg-white/5 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-white placeholder:text-white/70"
                    value={settings?.language || 'en'}
                    onChange={(e) => changeLanguage(e.target.value)}
                  >
                    <option value="en" className="bg-gray-900 text-white">English</option>
                    <option value="es" className="bg-gray-900 text-white">Spanish</option>
                    <option value="fr" className="bg-gray-900 text-white">French</option>
                    <option value="de" className="bg-gray-900 text-white">German</option>
                  </select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-white/10 pt-6">
                <Button 
                  onClick={handleUpdateLanguage} 
                  disabled={isSaving}
                >
                  {isSaving && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                  {saveSuccess.language ? (
                    <span className="flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Saved
                    </span>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        
          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-white/[0.05] backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Account Security</CardTitle>
                <CardDescription className="text-white/70">
                  Manage your account security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {renderEmailVerificationStatus()}
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-medium text-white mb-2">Password Management</h4>
                  <p className="text-sm text-white/70 mb-4">Change your account password</p>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setPasswordDialogOpen(true)}
                  >
                    Change Password
                  </Button>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <h4 className="font-medium text-white mb-2">Session Management</h4>
                  <p className="text-sm text-white/70 mb-4">Your current login session</p>
                  <div className="p-4 border border-white/10 rounded-md bg-white/5 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm text-white">Current Session</p>
                        <p className="text-xs text-white/70">Browser: {navigator.userAgent.split(" ")[0]}</p>
                      </div>
                      <div className="px-2 py-0.5 bg-green-500/20 text-green-500 text-xs rounded-full">Active</div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={signOutAllDevices}
                    disabled={isSigningOut}
                  >
                    {isSigningOut ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
                        Signing out...
                      </>
                    ) : (
                      'Sign Out All Devices'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Password Change Dialog */}
      <PasswordChangeDialog 
        open={passwordDialogOpen} 
        onOpenChange={setPasswordDialogOpen} 
      />
    </div>
  );
} 