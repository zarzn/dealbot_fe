import React from 'react';
import { FaGoogle, FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
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
    <div className="flex flex-col gap-6 w-full mt-6">
      {/* Properly styled separator with line on left and right of text */}
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/[0.12]" />
        </div>
        <div className="relative z-10 px-4 text-sm uppercase">
          <span className="bg-[#100d20] px-4 py-1 text-white/70">
            Or continue with
          </span>
        </div>
      </div>
      
      {/* Redesigned Social Login Buttons Section */}
      <div className="grid grid-cols-2 gap-3 mx-auto w-full max-w-md px-4 sm:grid-cols-3">
        {/* Google */}
        <button
          onClick={() => handleSocialAuth('google')}
          className="relative flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] py-3 px-4 text-white hover:bg-purple hover:border-purple transition-all duration-300"
          aria-label="Sign in with Google"
        >
          <FaGoogle className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Google</span>
          <span className="absolute inset-0 rounded-xl hover:shadow-[0_0_15px_rgba(128,90,213,0.5)] opacity-0 hover:opacity-100 transition-all duration-300"></span>
        </button>
        
        {/* Facebook */}
        <button
          onClick={() => handleSocialAuth('facebook')}
          className="relative flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] py-3 px-4 text-white hover:bg-purple hover:border-purple transition-all duration-300"
          aria-label="Sign in with Facebook"
        >
          <FaFacebook className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Facebook</span>
          <span className="absolute inset-0 rounded-xl hover:shadow-[0_0_15px_rgba(128,90,213,0.5)] opacity-0 hover:opacity-100 transition-all duration-300"></span>
        </button>
        
        {/* Twitter */}
        <button
          onClick={() => handleSocialAuth('twitter')}
          className="relative flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] py-3 px-4 text-white hover:bg-purple hover:border-purple transition-all duration-300"
          aria-label="Sign in with Twitter"
        >
          <FaTwitter className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Twitter</span>
          <span className="absolute inset-0 rounded-xl hover:shadow-[0_0_15px_rgba(128,90,213,0.5)] opacity-0 hover:opacity-100 transition-all duration-300"></span>
        </button>
        
        {/* Instagram */}
        <button
          onClick={() => handleSocialAuth('instagram')}
          className="relative flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] py-3 px-4 text-white hover:bg-purple hover:border-purple transition-all duration-300"
          aria-label="Sign in with Instagram"
        >
          <FaInstagram className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">Instagram</span>
          <span className="absolute inset-0 rounded-xl hover:shadow-[0_0_15px_rgba(128,90,213,0.5)] opacity-0 hover:opacity-100 transition-all duration-300"></span>
        </button>
        
        {/* LinkedIn */}
        <button
          onClick={() => handleSocialAuth('linkedin')}
          className="relative flex items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.05] py-3 px-4 text-white hover:bg-purple hover:border-purple transition-all duration-300"
          aria-label="Sign in with LinkedIn"
        >
          <FaLinkedin className="h-5 w-5" />
          <span className="hidden sm:inline text-sm font-medium">LinkedIn</span>
          <span className="absolute inset-0 rounded-xl hover:shadow-[0_0_15px_rgba(128,90,213,0.5)] opacity-0 hover:opacity-100 transition-all duration-300"></span>
        </button>
      </div>
      
      <p className="text-center text-white/50 text-xs mt-1">
        By continuing, you agree to our <a href="/terms" className="text-purple hover:underline">Terms of Service</a> and <a href="/privacy" className="text-purple hover:underline">Privacy Policy</a>
      </p>
    </div>
  );
};

export default SocialSignup;