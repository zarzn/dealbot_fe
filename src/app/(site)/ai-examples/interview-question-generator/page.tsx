"use client";
import PreviewGeneratedText from "@/components/AiTools/PreviewGeneratedText";
import Breadcrumb from "@/components/Breadcrumb";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import z from "zod";
import { integrations } from "../../../../../integrations.config";

// Define default messages
const defaultMessages = {
  opanAi: "OpenAI integration is not enabled. Please check your configuration."
};

const dataSchema = z.object({
  description: z.string(),
  jobTitle: z.string(),
  numberOfQuestions: z.string(),
});

const InterviewQuestionGeneratorPage = () => {
  const [generatedContent, setGeneratedContent] = useState("");
  const [data, setData] = useState({
    description: "",
  });

  const handleChange = (e: any) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setGeneratedContent("Loading....");

    // Check if OpenAI is enabled, assuming it's not if property doesn't exist
    if (!(integrations as any)?.isOpenAIEnabled) {
      toast.error(defaultMessages.opanAi);
      return;
    }

    const validation = dataSchema.safeParse(data);
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // the prompt
    const prompt = [
      {
        role: "user",
        content: `Generate 8 interview question for ${data.description}`,
      },
    ];

    //for the demo
    const apiKey = localStorage.getItem("apiKey");

    try {
      const response = await axios.post(
        "/api/generate-content",
        { prompt, apiKey },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setGeneratedContent(response.data);
    } catch (error: any) {
      setGeneratedContent("Please Add the API Key!");
      console.error("Error:", error.message);
    }

    setData({
      description: "",
    });
  };

  return (
    <>
      <title>
        Interview Question Generator | AI Agentic Deals System
      </title>
      <meta name="description" content="AI Interview Question Generator for AI Agentic Deals System" />
      <Breadcrumb pageTitle="Interview Question Generator" />

      <section className="pb-17.5 lg:pb-22.5 xl:pb-27.5">
        <div className="mx-auto grid max-w-[1170px] gap-8 px-4 sm:px-8 lg:grid-cols-12 xl:px-0">
          <div className="gradient-box rounded-lg bg-dark-8 p-8 lg:col-span-4 ">
            <h2 className="pb-2 text-2xl font-bold text-white">
              Question Topic
            </h2>
            <p className="pb-6">What your Question will be about?</p>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label htmlFor="description" className="pb-4">
                  Description
                </label>

                <textarea
                  onChange={handleChange}
                  value={data.description}
                  name="description"
                  className="min-h-[160px] rounded-lg border border-white/[0.12] bg-dark-7 px-5 py-3 text-white outline-none focus:border-purple"
                  placeholder="Interview description"
                  required
                />
              </div>

              <button
                type="submit"
                className="hero-button-gradient mt-5 w-full rounded-lg px-7 py-3 text-center font-medium text-white duration-300 ease-in hover:opacity-80 "
              >
                Generate
              </button>
            </form>
          </div>

          <PreviewGeneratedText
            generatedContent={generatedContent}
            height={262}
          />
        </div>
      </section>
    </>
  );
};

export default InterviewQuestionGeneratorPage;
