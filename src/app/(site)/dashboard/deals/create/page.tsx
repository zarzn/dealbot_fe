"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

export default function CreateDealPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/deals"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Create New Deal" 
          description="Discover deals based on your goals"
        />
      </div>
      
      <Card className="p-6 border-yellow-500/50 bg-yellow-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-lg text-yellow-500">Deal Creation Information</h3>
            <p className="mt-2 text-white/70">
              In this system, deals are automatically discovered based on your goals. To create deals:
            </p>
            <ol className="mt-3 space-y-2 list-decimal pl-5 text-white/70">
              <li>First create a goal with your desired product criteria</li>
              <li>Use the search functionality to find matching products</li>
              <li>Associate search results with your goals</li>
              <li>Deals will be automatically tracked based on your goals</li>
            </ol>
            <div className="mt-6 flex gap-4">
              <Button onClick={() => router.push('/dashboard/goals/create')}>
                Create a New Goal
              </Button>
              <Button variant="outline" onClick={() => router.push('/dashboard/deals')}>
                View Existing Deals
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
} 