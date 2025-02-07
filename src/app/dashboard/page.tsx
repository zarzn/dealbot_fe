import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/services/auth/config';

export const metadata: Metadata = {
  title: 'Dashboard - AI Agentic Deals System',
  description: 'Your AI-powered deal monitoring dashboard',
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Welcome back, {session.user.email}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Active Goals</h2>
          <p className="text-muted-foreground">You have no active goals yet.</p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Recent Deals</h2>
          <p className="text-muted-foreground">No deals found yet.</p>
        </div>
        <div className="p-6 bg-card rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Token Balance</h2>
          <p className="text-2xl font-bold">{session.user.token_balance} TOKENS</p>
        </div>
      </div>
    </div>
  );
} 