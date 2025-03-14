"use client";

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CreateEditDealForm } from '@/components/Deals/CreateEditDealForm';
import { PageHeader } from '@/components/ui/page-header';
import { toast } from 'sonner';
import { DealResponse } from '@/types/deals';
import { Loader } from '@/components/ui/loader';

export default function EditDealPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleSuccess = (deal: DealResponse) => {
    toast.success('Deal updated successfully');
    router.push(`/dashboard/deals/${deal.id}`);
  };

  if (!id) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/deals/${id}`}
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Edit Deal" 
          description="Modify deal information"
        />
      </div>
      
      <div className="bg-white/[0.02] rounded-xl p-6">
        <CreateEditDealForm dealId={id} onSuccess={handleSuccess} />
      </div>
    </div>
  );
} 