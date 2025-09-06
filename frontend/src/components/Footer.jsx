import React from "react";
import logo from "../assets/meetly.svg";

export default function Footer() {
  return (
    <footer className="bg-[#111827] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-8">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Meetly Logo"
            className="h-10 w-10 rounded-lg object-contain transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
          <span className="text-2xl font-bold text-[#2661EA] tracking-tight">
            Meetly
          </span>
        </div>

        {/* Copyright */}
        <p className="text-base text-[#9CA3AF] text-center">
          © 2025 Meetly. All rights reserved. Built for seamless collaboration.
        </p>
      </div>
    </footer>
  );
}
