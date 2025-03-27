"use client";

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CreateGoalForm } from "@/components/Goals/CreateGoalForm";

export default function CreateGoalPage() {
  const router = useRouter();

  const handleGoalCreationSuccess = () => {
    router.push('/dashboard/goals');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/goals"
          className="p-2 hover:bg-white/[0.05] rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Create New Goal</h1>
          <p className="text-white/70">Set up a new deal-finding goal</p>
        </div>
      </div>

      {/* Form */}
      <div className="w-full">
        <CreateGoalForm onSuccess={handleGoalCreationSuccess} />
      </div>
    </div>
  );
} 