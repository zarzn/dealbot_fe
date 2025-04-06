import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | RebatOn",
  description: "Learn how RebatOn collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
        <div className="container mx-auto">
          <div className="rounded-lg bg-white/5 px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
            <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
            <p className="mb-6">Last Updated: June 1, 2024</p>
            
            <div className="space-y-8">
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">1. Introduction</h2>
                <p className="mb-4">
                  Welcome to RebatOn. We respect your privacy and are committed to protecting your personal data.
                  This privacy policy will inform you about how we look after your personal data when you visit our website
                  and tell you about your privacy rights and how the law protects you.
                </p>
                <p>
                  This privacy policy applies to all information collected through our website and services.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">2. The Data We Collect About You</h2>
                <p className="mb-4">
                  We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li><strong>Identity Data</strong> includes first name, last name, username or similar identifier.</li>
                  <li><strong>Contact Data</strong> includes email address.</li>
                  <li><strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li>
                  <li><strong>Usage Data</strong> includes information about how you use our website and services.</li>
                  <li><strong>Deal Preference Data</strong> includes information about your shopping and deal preferences that you share with us.</li>
                </ul>
                <p>
                  We do not collect any Special Categories of Personal Data about you (this includes details about your race, ethnicity, religious or philosophical beliefs, sex life, sexual orientation, political opinions, trade union membership, information about your health, and genetic and biometric data).
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">3. How We Use Your Data</h2>
                <p className="mb-4">
                  We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>To register you as a new user</li>
                  <li>To provide personalized deal recommendations</li>
                  <li>To manage our relationship with you</li>
                  <li>To enable you to use interactive features of our service</li>
                  <li>To administer and protect our business and this website</li>
                  <li>To measure or understand the effectiveness of our service</li>
                </ul>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">4. Data Security</h2>
                <p className="mb-4">
                  We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.
                </p>
                <p>
                  We have put in place procedures to deal with any suspected personal data breach and will notify you and any applicable regulator of a breach where we are legally required to do so.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">5. Data Retention</h2>
                <p>
                  We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">6. Your Legal Rights</h2>
                <p className="mb-4">
                  Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 mb-4">
                  <li>Request access to your personal data</li>
                  <li>Request correction of your personal data</li>
                  <li>Request erasure of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing your personal data</li>
                  <li>Request transfer of your personal data</li>
                  <li>Right to withdraw consent</li>
                </ul>
                <p>
                  If you wish to exercise any of these rights, please contact us at privacy@rebaton.ai.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">7. Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">8. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top of this Privacy Policy.
                </p>
              </div>
              
              <div>
                <h2 className="mb-4 text-xl font-bold sm:text-2xl">9. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@rebaton.ai.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
} 