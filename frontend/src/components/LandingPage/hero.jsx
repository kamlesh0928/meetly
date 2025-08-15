import React from "react";
import { SignedOut, SignInButton } from "@clerk/clerk-react";

export default function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight">
          Connect, Collaborate, <br />
          <span className="text-[#3D52E7] bg-clip-text">Create Together</span>
        </h1>

        {/* Subheading */}
        <div className="mt-6 space-y-2">
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Experience seamless video meetings with crystal-clear quality.
          </p>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Join millions who trust Meetly for their most important
            conversations.
          </p>
        </div>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="px-6 py-3 bg-[#2563EB] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2 transform hover:scale-105"
            aria-label="Join a video meeting"
          >
            <i className="fa-solid fa-video"></i>
            Join a Meeting
          </button>
          <SignedOut>
            <SignInButton mode="modal">
              <button
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2 transform hover:scale-105"
                aria-label="Sign in to Meetly"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </section>
  );
}
