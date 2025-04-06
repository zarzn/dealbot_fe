import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | RebatOn",
  description: "Read the terms and conditions for using the RebatOn platform.",
};

export default function TermsOfServicePage() {
  return (
    <>
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
        <div className="container mx-auto">
          <div className="rounded-lg bg-white/5 px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
            <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Terms of Service</h1>
            <p className="mb-6">Last Updated: June 1, 2024</p>
            
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">1. Introduction</h2>
                <p className="mb-4">
                  Welcome to RebatOn. By using our website and services, you agree to be bound by these Terms of Service.
                  Please read these terms carefully before using our platform.
                </p>
                <p>
                  If you do not agree to these terms, please do not use our service.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">2. Definitions</h2>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Service</strong> refers to the RebatOn website and platform.</li>
                  <li><strong>User</strong> refers to any individual accessing or using the Service.</li>
                  <li><strong>Deals</strong> refer to the price offers, discounts, or promotions listed on our platform.</li>
                  <li><strong>Content</strong> refers to text, images, videos, and other materials that may appear on our Service.</li>
                </ul>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">3. Account Registration</h2>
                <p className="mb-4">
                  When you create an account with us, you guarantee that the information you provide is accurate, complete, and current at all times. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account.
                </p>
                <p className="mb-4">
                  You are responsible for maintaining the confidentiality of your account and password, including but not limited to restricting access to your computer and/or account. You agree to accept responsibility for any and all activities that occur under your account and/or password.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">4. User Conduct</h2>
                <p className="mb-4">
                  You agree not to use the Service:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>In any way that violates any applicable laws or regulations</li>
                  <li>To impersonate or attempt to impersonate another person or entity</li>
                  <li>To engage in any activity that interferes with or disrupts the Service</li>
                  <li>To attempt to probe, scan, or test the vulnerability of the Service</li>
                  <li>To upload or transmit viruses, malware, or other malicious code</li>
                </ul>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">5. Intellectual Property</h2>
                <p className="mb-4">
                  The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of RebatOn and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                </p>
                <p>
                  Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of RebatOn.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">6. Deal Information</h2>
                <p className="mb-4">
                  While we strive to provide accurate and up-to-date information regarding deals, we cannot guarantee the accuracy, completeness, or timeliness of the information. Deals are subject to availability and may change or expire without notice.
                </p>
                <p>
                  We are not responsible for any errors, omissions, or inaccuracies in deal information. You should verify all deal information before making a purchase.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">7. Limitation of Liability</h2>
                <p className="mb-4">
                  In no event shall RebatOn, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Your access to or use of or inability to access or use the Service</li>
                  <li>Any conduct or content of any third party on the Service</li>
                  <li>Any content obtained from the Service</li>
                  <li>Unauthorized access, use or alteration of your transmissions or content</li>
                </ul>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">8. Termination</h2>
                <p className="mb-4">
                  We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach the Terms.
                </p>
                <p>
                  All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity and limitations of liability.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">9. Changes to Terms</h2>
                <p>
                  We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">10. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at legal@rebaton.ai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 