"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import DropDown from "./DropDown";
import menuData from "./menuData";
import ClientLiveNotifications from "../Notifications/ClientLiveNotifications";

// Modified Logo component to accept an optional linkWrapper prop
const Logo = ({ linkWrapper = true }) => {
  const logoContent = (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
      className="text-blue-500 flex items-center text-black dark:text-white text-xl font-bold"
    >
      REBATON
    </motion.div>
  );

  // Return either wrapped in Link or just the content
  return linkWrapper ? (
    <Link
      href="/"
      className="flex items-center text-black dark:text-white text-xl font-bold"
    >
      {logoContent}
    </Link>
  ) : logoContent;
};

const Header = () => {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Use useSession hook to get auth state
  const { data: session, status: authStatus } = useSession();
  
  // Check for tokens to handle case where session might be missing but tokens exist
  const [hasTokens, setHasTokens] = useState(false);

  // Simplified authentication logic - if either auth mechanism reports logout, treat as logged out
  const isAuthenticated = authStatus === 'authenticated' && hasTokens;

  // Effect to check for tokens in localStorage (can only run client-side)
  useEffect(() => {
    if (typeof window === 'undefined') return; // Only run in browser
    
    setIsClient(true);
    
    // Function to check token status
    const checkTokens = () => {
      // Check if we have tokens in localStorage
      const accessToken = localStorage.getItem('access_token');
      setHasTokens(!!accessToken);
      
      // Log authentication status for debugging
      console.log("Header auth status:", { 
        nextAuthStatus: authStatus, 
        hasLocalTokens: !!accessToken,
        isAuthenticated: authStatus === 'authenticated' && !!accessToken
      });
    };
    
    // Initial check
    checkTokens();
    
    // Set up interval to check tokens regularly (every 2 seconds)
    // This ensures the header updates even if tokens are cleared elsewhere
    const intervalId = setInterval(checkTokens, 2000);
    
    // Listen for forced logout event
    const handleForceLogout = () => {
      console.log("Force logout event received in Header");
      setHasTokens(false);
    };
    
    window.addEventListener('force-logout', handleForceLogout);
    
    // Clean up interval and event listener on unmount
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('force-logout', handleForceLogout);
    };
  }, [authStatus, session]);

  const pathUrl = usePathname();

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);
  
  // Function for secure sign-out
  const handleSignOut = () => {
    // Clear tokens first to ensure immediate UI update
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setHasTokens(false);
    
    // Then navigate to the dedicated sign-out page
    window.location.href = "/auth/signout";
  };

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-[1000] w-full ${
          stickyMenu
            ? "before:features-row-border bg-dark/70 !py-4 shadow backdrop-blur-lg transition duration-100 before:absolute before:bottom-0 before:left-0 before:h-[1px] before:w-full lg:!py-0"
            : "py-7 lg:py-0"
        }`}
      >
        <div className="relative mx-auto max-w-[1170px] items-center justify-between px-4 sm:px-8 lg:flex xl:px-0">
          <div className="flex w-full items-center justify-between lg:w-1/4">
            {/* Use the Logo directly - it already has a Link inside */}
            <Logo />

            <button
              onClick={() => setNavigationOpen(!navigationOpen)}
              className="block lg:hidden"
            >
              <span className="relative block h-5.5 w-5.5 cursor-pointer">
                <span className="du-block absolute right-0 h-full w-full">
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-white delay-[0] duration-200 ease-in-out ${
                      !navigationOpen ? "!w-full delay-300" : "w-0"
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-white delay-150 duration-200 ease-in-out ${
                      !navigationOpen ? "delay-400 !w-full" : "w-0"
                    }`}
                  ></span>
                  <span
                    className={`relative left-0 top-0 my-1 block h-0.5 rounded-sm bg-white delay-200 duration-200 ease-in-out ${
                      !navigationOpen ? "!w-full delay-500" : "w-0"
                    }`}
                  ></span>
                </span>
                <span className="du-block absolute right-0 h-full w-full rotate-45">
                  <span
                    className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-white delay-300 duration-200 ease-in-out ${
                      !navigationOpen ? "!h-0 delay-[0]" : "h-full"
                    }`}
                  ></span>
                  <span
                    className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-white duration-200 ease-in-out ${
                      !navigationOpen ? "!h-0 delay-200" : "h-0.5"
                    }`}
                  ></span>
                </span>
              </span>
            </button>
          </div>

          <div
            className={`invisible h-0 w-full items-center justify-between lg:visible lg:flex lg:h-auto lg:w-3/4 ${
              navigationOpen
                ? "!visible relative mt-4 !h-auto max-h-[400px] overflow-y-scroll rounded-md bg-dark p-7.5 shadow-lg"
                : ""
            }`}
          >
            <nav>
              <ul className="flex flex-col gap-5 lg:flex-row lg:items-center lg:gap-2">
                {menuData.map((menuItem, key) => (
                  <li
                    key={key}
                    className={`nav__menu group relative ${
                      stickyMenu ? "lg:py-4" : "lg:py-7"
                    }`}
                  >
                    {menuItem.submenu ? (
                      <>
                        <DropDown menuItem={menuItem} />
                      </>
                    ) : (
                      <Link
                        href={`${menuItem.path}`}
                        className={`hover:nav-gradient relative border border-transparent px-4 py-1.5 text-sm hover:text-white ${
                          pathUrl === menuItem.path
                            ? "nav-gradient text-white"
                            : "text-white/80"
                        }`}
                      >
                        {menuItem.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            <div className="mt-7 flex items-center gap-6 lg:mt-0">
              {isAuthenticated ? (
                <>
                  <ClientLiveNotifications />
                  <Link 
                    href="/dashboard" 
                    className="text-sm font-medium text-white hover:text-purple transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    aria-label="Sign Out button"
                    onClick={handleSignOut}
                    className="text-sm text-white hover:text-opacity-75"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="text-sm text-white hover:text-opacity-75"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="button-border-gradient hover:button-gradient-hover relative flex items-center gap-1.5 rounded-lg px-4.5 py-2 text-sm text-white shadow-button hover:shadow-none"
                  >
                    Sign up
                    <svg
                      className="mt-0.5"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M14.4002 7.60002L9.2252 2.35002C9.0002 2.12502 8.6502 2.12502 8.4252 2.35002C8.2002 2.57502 8.2002 2.92502 8.4252 3.15002L12.6252 7.42502H2.0002C1.7002 7.42502 1.4502 7.67502 1.4502 7.97502C1.4502 8.27502 1.7002 8.55003 2.0002 8.55003H12.6752L8.4252 12.875C8.2002 13.1 8.2002 13.45 8.4252 13.675C8.5252 13.775 8.6752 13.825 8.8252 13.825C8.9752 13.825 9.1252 13.775 9.2252 13.65L14.4002 8.40002C14.6252 8.17502 14.6252 7.82503 14.4002 7.60002Z"
                        fill="white"
                      />
                    </svg>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
