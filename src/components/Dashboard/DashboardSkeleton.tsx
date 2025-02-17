"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <Skeleton variant="title" className="mb-4" />
            <Skeleton variant="text" className="w-1/2" />
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Chart Section */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-6">
              <Skeleton variant="title" className="w-1/4" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="w-20 h-8 rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton variant="card" className="h-[300px]" />
          </div>

          {/* Active Goals Section */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-6">
              <Skeleton variant="title" className="w-1/4" />
              <Skeleton className="w-32 h-9 rounded-lg" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white/[0.02] rounded-lg">
                  <Skeleton variant="avatar" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-3/4" />
                    <Skeleton variant="text" className="w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Deal Metrics */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <Skeleton variant="title" className="mb-6" />
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton variant="text" className="w-1/3" />
                  <Skeleton variant="text" className="w-1/4" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white/[0.05] rounded-xl p-6 backdrop-blur-lg">
            <Skeleton variant="title" className="mb-6" />
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton variant="avatar" className="w-8 h-8" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" className="w-full" />
                    <Skeleton variant="text" className="w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 