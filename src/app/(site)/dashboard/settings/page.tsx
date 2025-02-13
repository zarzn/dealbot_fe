"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Bell, Mail, Palette, Globe, CreditCard } from 'lucide-react';
import DashboardHeader from '@/components/Dashboard/DashboardHeader';

const Settings = () => {
  const { data: session } = useSession();
  const [preferences, setPreferences] = useState({
    notification_email: true,
    notification_push: true,
    notification_sms: false,
    deal_alert_threshold: 20,
    preferred_markets: ['amazon', 'walmart'],
    preferred_categories: ['electronics', 'home'],
    currency: 'USD',
    language: 'en',
    theme: 'dark'
  });

  const handlePreferenceChange = async (key: string, value: any) => {
    try {
      const response = await fetch('/api/v1/auth/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value })
      });

      if (response.ok) {
        setPreferences(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Section */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Profile</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={session?.user?.email || ''}
                    disabled
                    className="w-full px-4 py-2 bg-white/[0.05] rounded-lg border border-white/10 focus:border-purple focus:ring-1 focus:ring-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-white/[0.05] rounded-lg border border-white/10 focus:border-purple focus:ring-1 focus:ring-purple"
                  />
                </div>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Notifications</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-purple" />
                    <div>
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-white/70">Get deal alerts via email</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notification_email}
                      onChange={(e) => handlePreferenceChange('notification_email', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-purple" />
                    <div>
                      <div className="font-medium">Push Notifications</div>
                      <div className="text-sm text-white/70">Get instant deal alerts</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.notification_push}
                      onChange={(e) => handlePreferenceChange('notification_push', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Deal Alert Threshold (%)</label>
                  <input
                    type="number"
                    value={preferences.deal_alert_threshold}
                    onChange={(e) => handlePreferenceChange('deal_alert_threshold', parseInt(e.target.value))}
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 bg-white/[0.05] rounded-lg border border-white/10 focus:border-purple focus:ring-1 focus:ring-purple"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Markets</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['amazon', 'walmart', 'ebay', 'target'].map(market => (
                      <label key={market} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.preferred_markets.includes(market)}
                          onChange={(e) => {
                            const newMarkets = e.target.checked
                              ? [...preferences.preferred_markets, market]
                              : preferences.preferred_markets.filter(m => m !== market);
                            handlePreferenceChange('preferred_markets', newMarkets);
                          }}
                          className="rounded border-white/10 text-purple focus:ring-purple bg-white/[0.05]"
                        />
                        <span className="capitalize">{market}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Preferred Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['electronics', 'home', 'fashion', 'books', 'toys', 'sports'].map(category => (
                      <label key={category} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={preferences.preferred_categories.includes(category)}
                          onChange={(e) => {
                            const newCategories = e.target.checked
                              ? [...preferences.preferred_categories, category]
                              : preferences.preferred_categories.filter(c => c !== category);
                            handlePreferenceChange('preferred_categories', newCategories);
                          }}
                          className="rounded border-white/10 text-purple focus:ring-purple bg-white/[0.05]"
                        />
                        <span className="capitalize">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Settings */}
          <div className="space-y-8">
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Quick Settings</h2>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-purple/20 hover:bg-purple/30 rounded-lg text-left transition flex items-center space-x-3">
                  <Globe className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Language</div>
                    <div className="text-sm text-white/70">English (US)</div>
                  </div>
                </button>
                <button className="w-full px-4 py-3 bg-purple/20 hover:bg-purple/30 rounded-lg text-left transition flex items-center space-x-3">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Currency</div>
                    <div className="text-sm text-white/70">USD ($)</div>
                  </div>
                </button>
                <button className="w-full px-4 py-3 bg-purple/20 hover:bg-purple/30 rounded-lg text-left transition flex items-center space-x-3">
                  <Palette className="w-5 h-5" />
                  <div>
                    <div className="font-semibold">Theme</div>
                    <div className="text-sm text-white/70">Dark Mode</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Account</h2>
              <div className="space-y-4">
                <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg transition">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings; 