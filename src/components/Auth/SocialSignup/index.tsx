import React from 'react';
import { FaGoogle, FaFacebook, FaTwitter } from 'react-icons/fa';
import { authService } from '@/services/auth';
import { toast } from 'react-hot-toast';

interface SocialSignupProps {
  mode: 'signin' | 'signup';
}

const SocialSignup: React.FC<SocialSignupProps> = ({ mode }) => {
  const handleSocialAuth = async (provider: string) => {
    try {
      await authService.handleSocialLogin(provider);
    } catch (error: any) {
      toast.error(error.message || `${provider} authentication failed`);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => handleSocialAuth('google')}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FaGoogle className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleSocialAuth('facebook')}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FaFacebook className="h-4 w-4" />
        </button>
        <button
          onClick={() => handleSocialAuth('twitter')}
          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <FaTwitter className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default SocialSignup; 