import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import { authService } from '@/services/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const MagicLink: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestMagicLink(email);
      toast.success('Magic link sent! Please check your email');
      
      // Optionally redirect to a confirmation page
      router.push('/auth/check-email');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Magic Link Sign In</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your email to receive a magic link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={isLoading}
            required
          />
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Magic Link'}
        </Button>
      </form>

      <p className="text-sm text-center text-muted-foreground">
        We&apos;ll send you a magic link to sign in instantly
      </p>
    </div>
  );
};

export default MagicLink; 