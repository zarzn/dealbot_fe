"use client";

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { DealDetail } from '@/components/Deals/DealDetail';
import { Loader } from '@/components/ui/loader';
import { PageHeader } from '@/components/ui/page-header';

export default function DealDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const handleBack = () => {
    router.push('/dashboard/deals');
  };

  const handleDelete = () => {
    // After successful deletion, navigate back to deals list
    router.push('/dashboard/deals');
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
          title="Deal Details" 
          description="View and manage deal information"
        />
      </div>
      
      {!id ? (
        <div className="flex justify-center items-center h-64">
          <Loader size="lg" />
        </div>
      ) : (
        <DealDetail 
          dealId={id}
          onDelete={handleDelete}
          onBack={handleBack}
        />
      )}
    </div>
  );
} 