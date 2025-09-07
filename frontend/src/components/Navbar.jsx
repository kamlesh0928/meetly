import React, { useState } from "react";
import logo from "../assets/meetly.svg";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Meetly Logo"
              className="h-10 w-10 rounded-lg"
              loading="lazy"
            />
            <span className="text-2xl font-bold text-[#2661EA] tracking-tight">
              Meetly
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <SignedOut>
              <SignInButton mode="l">
                <button
                  className="px-4 py-2 text-gray-700 bg-white rounded-lg font-medium transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2"
                  aria-label="Sign in to Meetly"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="px-4 py-2 text-white bg-[#2661EA] rounded-lg font-medium transition-colors duration-200 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2"
                  aria-label="Get started with Meetly"
                >
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-12 h-12 min-w-[44px] min-h-[44px]",
                    userButtonBox: "bg-transparent border-none p-0 m-0",
                    avatarImage: "w-full h-full",
                  },
                }}
              />
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#2661EA] rounded-md"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={
                    isMenuOpen
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 flex flex-col space-y-3 pb-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg font-medium transition-colors duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2"
                  aria-label="Sign in to Meetly"
                  onClick={toggleMenu}
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  className="px-4 py-2 text-white bg-[#2661EA] rounded-lg font-medium transition-colors duration-200 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2"
                  aria-label="Get started with Meetly"
                  onClick={toggleMenu}
                >
                  Get Started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-14 h-14 min-w-[56px] min-h-[56px]",
                    userButtonBox: "bg-transparent border-none p-0 m-0",
                    avatarImage: "w-full h-full",
                  },
                }}
                onClick={toggleMenu}
              />
            </SignedIn>
          </div>
        )}
      </div>
    </nav>
  );
}
