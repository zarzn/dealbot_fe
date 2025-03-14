"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CreateEditDealForm } from '@/components/Deals/CreateEditDealForm';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { DealResponse } from '@/types/deals';

export default function CreateDealPage() {
  const router = useRouter();

  const handleSuccess = (deal: DealResponse) => {
    toast.success('Deal created successfully');
    router.push(`/dashboard/deals/${deal.id}`);
  };

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
          description="Add a new deal to the platform"
        />
      </div>
      
      <div className="bg-white/[0.02] rounded-xl p-6">
        <CreateEditDealForm onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 