"use client";

import { LoginForm } from "@/features/auth/login-form";
import { ShieldCheck, HelpCircle, Info } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col relative font-sans text-gray-900 bg-[#eef1f6] overflow-hidden">
      {/* Background Graphic matching the screenshot aesthetic */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#c8d8ec] to-[#e4ebf5] opacity-60"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100 rounded-[100px] rotate-45 mix-blend-multiply opacity-30 blur-3xl"></div>
      </div>
      
      {/* Top Navbar Area */}
      <div className="w-full h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-10 shadow-sm shrink-0">
        <h1 className="text-xl font-bold tracking-tight text-[#083A81]">LeaveFlow</h1>
        <div className="flex gap-4">
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-gray-900 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10 w-full relative">
        <div className="w-full max-w-[440px] bg-[#f0f2f5] rounded-xl p-8 sm:p-10 shadow-lg border border-gray-200 mb-6 relative">
          <div className="flex flex-col items-center mb-8 text-center">
            <h2 className="text-[28px] font-extrabold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-sm text-gray-600">
              Please enter your details to access your dashboard.
            </p>
          </div>
          
          <LoginForm />
        </div>

        {/* Enterprise Security Banner */}
        <div className="w-full max-w-[440px] bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-sm border border-gray-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-[11px] font-bold text-gray-900 mb-1">Enterprise Security</h4>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Your data is protected by industry-standard AES-256 encryption and multi-factor authentication protocols.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Area */}
      <div className="w-full h-16 bg-[#f8fafc] border-t border-gray-200 flex items-center justify-between px-8 z-10 mt-auto shrink-0 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-bold text-gray-900 text-sm">LeaveFlow</span>
          <span className="text-gray-500">&copy; 2024 LeaveFlow Systems. All rights reserved.</span>
        </div>
        <div className="flex gap-6 text-gray-600 font-semibold">
          <a href="#" className="hover:text-[#083A81] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#083A81] transition-colors">Security Standards</a>
          <a href="#" className="hover:text-[#083A81] transition-colors">Support</a>
        </div>
      </div>
    </div>
  );
}
