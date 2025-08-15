import React from "react";
import logo from "../assets/meetly.svg";

export default function EnterName() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-120 h-100 border border-gray-300 rounded-lg shadow-lg p-6 bg-white">
        {/* Logo Section */}
        <div className="flex justify-center items-center space-x-3">
          <img
            src={logo}
            alt="Meetly Logo"
            className="h-13 w-13 rounded-lg object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        </div>

        <div className="mt-4 text-center">
          <p className="text-2xl font-bold text-gray-800">Welcome to Meetly</p>
          <p className="mt-2 text-lg text-gray-600">
            Enter your name to continue as a guest
          </p>
        </div>

        <div className="mt-4 items-center">
          <p className="text-sm text-center text-gray-600">Your Name</p>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full mt-2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          />
          <button className="mt-4 w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200">
            Continue as Guest
          </button>
          <button className="mt-2 w-full p-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-200">
            Sign In Instead
          </button>
        </div>
      </div>
    </div>
  );
}
