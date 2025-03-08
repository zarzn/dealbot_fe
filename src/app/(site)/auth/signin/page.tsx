import Signin from "@/components/Auth/SignIn";
import Breadcrumb from "@/components/Breadcrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in | AI Agentic Deals System",
  description: "Sign in to your AI Agentic Deals System account",
  // other metadata
};

const SigninPage = () => {
  return (
    <>
      <Breadcrumb pageTitle="Sign in" />

      <Signin />
    </>
  );
};

export default SigninPage;
