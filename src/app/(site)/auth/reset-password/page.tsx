import ResetPassword from '@/components/Auth/ResetPassword';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata = {
  title: 'Reset Password | AI Deals System',
  description: 'Reset your password',
};

export default function ResetPasswordPage() {
  return (
    <>
      <Breadcrumb pageTitle="Reset Password" />
      <ResetPassword />
    </>
  );
} 