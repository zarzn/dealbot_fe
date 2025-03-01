import React from 'react';

// IMPORTANT: This configuration must match the values in integrations.config.ts
// If you update this file, also update integrations.config.ts to maintain consistency
export const integrations = {
  isSanityEnabled: false, // Set to true when Sanity is properly configured
  isNewsletterEnabled: true,
  isPricingEnabled: true,
  isSupportEnabled: true,
  isReviewsEnabled: true,
  isClientsEnabled: true,
} as const;

const messages = {
  sanity: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Sanity is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  stripe: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Stripe is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  opanAi: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      OpenAI is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  mailchimp: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Mailchimp is not enabled. Follow the {""}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),
  auth: (
    <div style={{ whiteSpace: "pre-wrap" }}>
      Auth is not enabled. Follow the{" "}
      <a
        href="https://nextjstemplates.com/docs/enableintegration"
        className="text-primary underline"
      >
        documentation
      </a>{" "}
      to enable it.
    </div>
  ),

  // Add more messages here
};

export { messages };
