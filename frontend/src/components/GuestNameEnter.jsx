import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SignInButton } from "@clerk/clerk-react";

import logo from "../assets/meetly.svg";

export default function GuestNameEnter() {
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!guestName.trim()) {
      setError("Please enter your name");
    } else {
      const formattedName = `${guestName.trim()} (Guest)`;
      setGuestName(formattedName);
      sessionStorage.setItem("guestName", formattedName);
      setError("");
      setGuestName("");
      navigate("/meeting");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex justify-center items-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300">
        {/* Logo Section */}
        <div className="flex justify-center items-center space-x-3">
          <img
            src={logo}
            alt="Meetly Logo"
            className="h-12 w-12 rounded-lg object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>

        {/* Heading and Subheading */}
        <div className="mt-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome to Meetly
          </h2>
          <p className="mt-2 text-base sm:text-lg text-gray-600">
            Enter your name to continue as a guest
          </p>
        </div>

        {/* Form Section */}
        <div className="mt-6">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-600 text-center"
          >
            Your Name
          </label>
          <div className="relative">
            <i className="fa-solid fa-user-plus absolute pt-2 left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input
              id="name"
              type="text"
              value={guestName}
              onChange={(e) => {
                setGuestName(e.target.value);
                setError("");
              }}
              placeholder="Enter your name"
              className={`w-full mt-2 p-3 pl-10 border ${
                error ? "border-red-300" : "border-gray-300"
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2661EA] transition duration-200`}
              aria-invalid={error ? "true" : "false"}
              aria-describedby={error ? "name-error" : undefined}
            />
          </div>
          {error && (
            <p
              id="name-error"
              className="mt-2 text-sm text-red-600 text-center"
            >
              {error}
            </p>
          )}
          <button
            onClick={handleContinue}
            className="mt-4 w-full p-3 bg-[#2661EA] text-white font-medium rounded-lg transition-all duration-200 hover:bg-[#1d4ed8] focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2 transform hover:scale-105"
            aria-label="Continue as a guest"
          >
            Continue as Guest
          </button>
          <SignInButton mode="modal">
            <button
              className="mt-3 w-full p-3 border border-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2661EA] focus:ring-offset-2 transform hover:scale-105"
              aria-label="Sign in to Meetly"
            >
              Sign In Instead
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
