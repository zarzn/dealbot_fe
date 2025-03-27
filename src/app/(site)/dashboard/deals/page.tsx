"use client";

import React, { useState } from 'react';
import ClientDealSection from '@/components/Deals/ClientDealSection';
import { PageHeader } from "@/components/ui/page-header";

export default function DealsPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Deals Management"
        description="View, create, and manage your deals"
      />
      
      <ClientDealSection />
    </div>
  );
} 