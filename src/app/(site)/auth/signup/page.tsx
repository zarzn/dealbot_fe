import Signup from '@/components/Auth/Signup';
import Breadcrumb from '@/components/Breadcrumb';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Sign Up | AI Deals System',
  description: 'Create your account to start tracking deals',
  // other metadata
};

export default function SignUpPage() {
  return (
    <>
      <Breadcrumb pageTitle="Sign Up" />
      <Signup />
    </>
  );
}
