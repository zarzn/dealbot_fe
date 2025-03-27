"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import SectionTitle from "../Common/SectionTitle";
import { toast } from "react-hot-toast";

const Support = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (formData.message.length < 10) {
      toast.error("Please provide a more detailed message");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Directly submit to backend as the logs show this is the URL being used
      const response = await fetch("http://localhost:8000/api/v1/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || "Failed to send message");
      }
      
      // Success
      setFormSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      toast.success(data.message || "Message sent successfully!");
      
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="support" className="scroll-mt-17">
      <div className="mx-auto max-w-[1170px] px-4 sm:px-8 xl:px-0">
        <div className="relative z-999 overflow-hidden rounded-[30px] bg-dark px-4 pt-25 sm:px-20 lg:px-27.5 mb-16">
          {/* <!-- grid row --> */}
          <div className="absolute -top-[16%] left-1/2 -z-1 flex w-full max-w-[690px] -translate-x-1/2 justify-center gap-7.5 opacity-40">
            <div className="pricing-grid pricing-grid-border relative bottom-12 h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative bottom-7 h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative bottom-3 h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative bottom-2 h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative bottom-5 h-[250px] w-full max-w-[50px]"></div>
            <div className="pricing-grid pricing-grid-border relative bottom-8 h-[250px] w-full max-w-[50px]"></div>
          </div>

          {/* <!-- stars --> */}
          <div className="absolute -top-30 left-1/2 -z-1 h-60 w-full max-w-[482px] -translate-x-1/2 overflow-hidden">
            <div className="stars"></div>
            <div className="stars2"></div>
          </div>

          {/* <!-- bg shapes --> */}
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <span className="absolute left-1/2 top-0 -z-1 h-full w-full -translate-x-1/2 bg-[url(/images/blur/blur-19.svg)] bg-cover bg-center bg-no-repeat"></span>

            <span className="absolute left-1/2 top-0 -z-1 aspect-square w-full -translate-x-1/2">
              <Image
                src="/images/blur/blur-20.svg"
                alt="blur"
                fill
                className="max-w-none"
              />
            </span>
            <span className="absolute left-1/2 top-0 -z-1 mx-auto w-full max-w-[530px] -translate-x-1/2" style={{ aspectRatio: '1 / 1.3' }}>
              <Image
                src="/images/blur/blur-21.svg"
                alt="blur"
                fill
                className="max-w-none"
              />
            </span>
          </div>

          <SectionTitle
            subTitle="Need Any Help?"
            title="Contact With Us"
            paragraph="Have questions about our AI-powered deal finding system? We're here to help!"
          />

          {/* <!-- support form --> */}
          <div className="form-box-gradient relative overflow-hidden rounded-[25px] pr-8 pb-8 pl-8 sm:pr-12 sm:pb-12 sm:pl-12 xl:pr-20 xl:pb-20 xl:pl-20">
            {formSuccess ? (
              <div className="relative z-10 max-w-[820px] mx-auto text-center py-12">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-white">Thank You!</h3>
                <p className="mb-8 text-lg text-gray-300">
                  Your message has been sent successfully. We&apos;ll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setFormSuccess(false)}
                  className="inline-flex rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-4 text-base font-medium text-white transition duration-300 ease-in-out hover:opacity-80"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                action="/api/v1/contact"
                method="POST"
                className="relative z-10 max-w-[820px] mx-auto"
              >
                <div className="flex flex-wrap -mx-4">
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="name"
                        className="mb-3 block font-medium text-white"
                      >
                        Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your Name"
                        required
                        className="w-full rounded-lg border border-white/[0.12] bg-white/[0.05] px-6 py-4 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4 md:w-1/2">
                    <div className="mb-8">
                      <label
                        htmlFor="email"
                        className="mb-3 block font-medium text-white"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your Email"
                        required
                        className="w-full rounded-lg border border-white/[0.12] bg-white/[0.05] px-6 py-4 text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <div className="mb-8">
                      <label
                        htmlFor="message"
                        className="mb-3 block font-medium text-white"
                      >
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Type your message"
                        rows={6}
                        required
                        className="w-full rounded-lg border border-white/[0.12] bg-white/[0.05] px-6 py-4 text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>
                  </div>
                  <div className="w-full px-4">
                    <div className="text-center">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`inline-flex rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-4 text-base font-medium text-white transition duration-300 ease-in-out 
                          ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-80'}`}
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          'Send Message'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Support;
