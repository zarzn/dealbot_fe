"use client";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import NextTopLoader from "nextjs-toploader";
import "@/styles/animate.css";
import "@/styles/prism-vsc-dark-plus.css";
import "@/styles/star.css";
import "@/styles/tailwind.css";
import AuthProvider from "../context/AuthContext";
import ToasterContext from "../context/ToastContext";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextTopLoader
        color="#3B82F6"
        crawlSpeed={300}
        showSpinner={false}
        shadow="none"
      />
      <AuthProvider>
        <ToasterContext />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <ScrollToTop />
      </AuthProvider>
    </>
  );
}
