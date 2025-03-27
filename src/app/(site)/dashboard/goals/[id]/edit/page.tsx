"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Save, Clock, Tag } from 'lucide-react';
import { goalsService } from '@/services/goals';
import { toast } from 'sonner';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EditGoalForm } from '@/components/Goals/EditGoalForm';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Goal } from '@/services/goals';

export default function EditGoalPage() {
  const params = useParams();
  const router = useRouter();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGoal();
  }, []);

  // Load goal data from the API
  const loadGoal = async () => {
    const goalId = params?.id;
    if (!goalId || Array.isArray(goalId)) {
      setError("Invalid goal ID");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const goalData = await goalsService.getGoalById(goalId);
      setGoal(goalData);
    } catch (error: any) {
      console.error("Error loading goal:", error);
      setError(error.message || 'Failed to load goal');
      toast.error(error.message || 'Failed to load goal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccess = () => {
    toast.success("Goal updated successfully!");
    // Navigate back to the goal details page
    router.push(`/dashboard/goals/${params?.id}`);
  };

  const handleCancel = () => {
    router.push(`/dashboard/goals/${params?.id}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Error Loading Goal</h2>
        <p className="text-white/70 mb-4">{error}</p>
        <Link href="/dashboard/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-semibold mb-2">Goal Not Found</h2>
        <p className="text-white/70 mb-4">This goal may have been deleted or doesn&apos;t exist.</p>
        <Link href="/dashboard/goals">
          <Button>Back to Goals</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <Breadcrumb>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/goals">Goals</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/dashboard/goals/${params?.id}`}>{goal.title}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>Edit</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/goals/${params?.id}`}
              className="p-2 hover:bg-white/[0.05] rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Edit Goal
              </h1>
              <p className="text-white/60">Update your goal details and preferences</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal Details */}
      <Card>
        <CardHeader>
          <CardTitle>{goal.title}</CardTitle>
          <CardDescription className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Tag className="w-4 h-4" />
              <span>{goal.itemCategory || "No category"}</span>
            </div>
            {goal.deadline && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Due {new Date(goal.deadline).toLocaleDateString()}</span>
              </div>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Edit Form */}
          <EditGoalForm goal={goal} onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
} 