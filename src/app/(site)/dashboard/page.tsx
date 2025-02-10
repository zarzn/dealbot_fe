"use client";

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';

// Components will be created separately
import DashboardHeader from '@/components/Dashboard/DashboardHeader';
import TokenBalance from '@/components/Dashboard/TokenBalance';
import ActiveGoals from '@/components/Dashboard/ActiveGoals';
import RecentDeals from '@/components/Dashboard/RecentDeals';
import DealMetrics from '@/components/Dashboard/DealMetrics';
import ActivityFeed from '@/components/Dashboard/ActivityFeed';

const Dashboard = () => {
  const { data: session } = useSession();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <DashboardHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <TokenBalance />
          </div>
          
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold mb-2">Active Goals</h3>
            <div className="text-3xl font-bold text-purple">12</div>
            <div className="text-white/70 text-sm mt-2">4 near deadline</div>
          </div>
          
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold mb-2">Deals Found</h3>
            <div className="text-3xl font-bold text-green-400">48</div>
            <div className="text-white/70 text-sm mt-2">↑ 12% this week</div>
          </div>
          
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <div className="text-3xl font-bold text-blue-400">92%</div>
            <div className="text-white/70 text-sm mt-2">Based on 100 deals</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chart Section */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Deal Performance</h2>
                <div className="flex gap-2">
                  {['week', 'month', 'year'].map((timeframe) => (
                    <button
                      key={timeframe}
                      onClick={() => setSelectedTimeframe(timeframe)}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        selectedTimeframe === timeframe
                          ? 'bg-purple text-white'
                          : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.1]'
                      }`}
                    >
                      {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip />
                    <Line type="monotone" dataKey="deals" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Active Goals Section */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Active Goals</h2>
                <Link 
                  href="/goals/create"
                  className="px-4 py-2 bg-purple rounded-lg text-white hover:bg-purple/80 transition"
                >
                  New Goal
                </Link>
              </div>
              <ActiveGoals />
            </div>

            {/* Recent Deals Section */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Deals</h2>
                <Link 
                  href="/deals"
                  className="text-purple hover:underline"
                >
                  View All
                </Link>
              </div>
              <RecentDeals />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Deal Metrics */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Deal Metrics</h2>
              <DealMetrics />
            </div>

            {/* Activity Feed */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
              <ActivityFeed />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-purple/20 hover:bg-purple/30 rounded-lg text-left transition">
                  <div className="font-semibold">Create New Goal</div>
                  <div className="text-sm text-white/70">Set up deal tracking</div>
                </button>
                <button className="w-full px-4 py-3 bg-purple/20 hover:bg-purple/30 rounded-lg text-left transition">
                  <div className="font-semibold">Add Tokens</div>
                  <div className="text-sm text-white/70">Top up your balance</div>
                </button>
                <button className="w-full px-4 py-3 bg-purple/20 hover:bg-purple/30 rounded-lg text-left transition">
                  <div className="font-semibold">Connect Wallet</div>
                  <div className="text-sm text-white/70">Link your Solana wallet</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 