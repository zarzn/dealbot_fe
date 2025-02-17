"use client"

import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  heading: string;
  text?: string;
}

export default function DashboardHeader({ heading, text }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 30,
      }}
      className="mb-8"
    >
      <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
      {text && (
        <p className="mt-2 text-sm text-white/60">
          {text}
        </p>
      )}
    </motion.div>
  );
} 