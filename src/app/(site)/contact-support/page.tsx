import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Support | RebatOn",
  description: "Get help and support for using the RebatOn platform.",
};

export default function ContactSupportPage() {
  return (
    <>
      <section className="pb-16 pt-24 md:pb-20 md:pt-28 lg:pb-24 lg:pt-32">
        <div className="container mx-auto">
          <div className="rounded-lg bg-white/5 px-8 py-11 sm:p-[55px] lg:mb-5 lg:px-8 xl:p-[55px]">
            <h1 className="mb-8 text-3xl font-bold sm:text-4xl">Contact Support</h1>
            
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
              <div className="space-y-8">
                <div>
                  <h2 className="mb-6 text-xl font-bold sm:text-2xl">We&apos;re Here to Help</h2>
                  <p className="mb-4">
                    Need assistance with using RebatOn? Our support team is ready to help you with any questions or issues you may have.
                  </p>
                  <p className="mb-4">
                    Please fill out the form with details about your inquiry, and we&apos;ll get back to you as soon as possible.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Email Support</h3>
                      <p className="text-white/70">
                        <a href="mailto:support@rebaton.ai" className="hover:text-primary">
                          support@rebaton.ai
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Help Center</h3>
                      <p className="text-white/70">
                        <a href="/how-to-use" className="hover:text-primary">
                          Visit our help guides
                        </a>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">FAQs</h3>
                      <p className="text-white/70">
                        <a href="/how-to-use/faq" className="hover:text-primary">
                          Frequently asked questions
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-white/5 p-8">
                <form className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="block text-sm font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 placeholder-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 placeholder-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Your email address"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="subject" className="block text-sm font-medium">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 placeholder-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="" disabled selected>Select a subject</option>
                      <option value="general">General Question</option>
                      <option value="account">Account Issue</option>
                      <option value="deals">Deal Problem</option>
                      <option value="tokens">Token System</option>
                      <option value="bug">Report a Bug</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 placeholder-white/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Describe your issue or question in detail"
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-white/10 border border-white/10 px-6 py-3 text-center font-medium text-white transition-colors hover:bg-white/20"
                  >
                    Send Message
                  </button>
                  
                  <p className="text-center text-sm text-white/70">
                    We typically respond within 24 hours during business days.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}