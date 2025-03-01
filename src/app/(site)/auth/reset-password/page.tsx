"use client";

import ResetPassword from '@/components/Auth/ResetPassword';
import Breadcrumb from '@/components/Breadcrumb';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') || '';

  return (
    <>
      <Breadcrumb pageTitle="Reset Password" />
      <ResetPassword token={token} />
    </>
  );
} 