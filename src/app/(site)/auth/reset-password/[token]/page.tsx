import React from "react";

import { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import ResetPassword from "@/components/Auth/ResetPassword";

export const metadata: Metadata = {
  title: "Reset Password | AI Deals System",
  description: "Reset your password",
  // other metadata
};

interface ResetPasswordPageProps {
  params: {
    token: string;
  };
}

export default function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  return (
    <>
      <Breadcrumb pageTitle="Reset Password" />
      <ResetPassword token={params.token} />
    </>
  );
}
