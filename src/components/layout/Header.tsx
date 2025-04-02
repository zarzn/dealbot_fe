import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeaderProps {
  showLoginButton?: boolean;
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  showLoginButton = true,
  transparent = false 
}) => {
  return (
    <header 
      className={`w-full py-4 px-4 md:px-6 ${
        transparent ? "bg-transparent" : "bg-black/90 border-b border-white/10"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/logo/logo.png" 
              alt="Agentic Deals Logo" 
              width={140} 
              height={40} 
              className="h-10 w-auto"
            />
          </Link>
        </motion.div>

        {showLoginButton && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Link href="/auth/signin">
              <Button variant="outline" size="sm">
                Sign In
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header; 