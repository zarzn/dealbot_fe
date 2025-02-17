"use client"

import { motion, AnimatePresence } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ 
          opacity: 0,
          y: 20,
          scale: 0.98
        }}
        animate={{ 
          opacity: 1,
          y: 0,
          scale: 1
        }}
        exit={{ 
          opacity: 0,
          y: 20,
          scale: 0.98
        }}
        transition={{
          duration: 0.4,
          type: "spring",
          stiffness: 380,
          damping: 30,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 