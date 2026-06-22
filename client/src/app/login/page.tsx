"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Check, Clock, Users, ArrowRight } from "lucide-react";
import { LoginForm } from "@/features/auth/login-form";

const features = [
  "Smart Leave Tracking",
  "Real-Time Approval Workflow",
  "Enterprise Analytics Dashboard"
];

const floatingAnimation = {
  y: ["-10px", "10px", "-10px"],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex bg-[#0B0F19] text-white selection:bg-[#4F46E5]/30 overflow-hidden font-sans relative">
      
      {/* 
        ========================================================================
        PREMIUM AURORA / MESH BACKGROUND
        ======================================================================== 
      */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep base radial lighting */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(11,15,25,1)_0%,_rgba(5,7,12,1)_100%)]" />
        
        {/* Animated Aurora Orbs */}
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#4F46E5]/20 blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#7C3AED]/20 blur-[150px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: 4 }}
          className="absolute bottom-[-10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-[#3B82F6]/20 blur-[150px] mix-blend-screen" 
        />

        {/* Animated Particles (Dots) */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LCAyNTUsIDI1NSwgMC4wNSkiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZG90cykiLz48L3N2Zz4=')] bg-center [mask-image:radial-gradient(ellipse_at_center,white,rgba(255,255,255,0))] opacity-40" />
      </div>

      {/* 
        ========================================================================
        LEFT PANE: Enterprise Branding
        ======================================================================== 
      */}
      <div className="hidden lg:flex w-full lg:w-[55%] relative flex-col justify-center p-12 xl:p-20 z-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          {/* Logo */}
          <div className="flex items-center gap-4 mb-12">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] rounded-2xl blur opacity-70 group-hover:opacity-100 transition duration-500" />
              <div className="relative w-14 h-14 rounded-2xl bg-[#0B0F19] border border-white/10 flex items-center justify-center">
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-[#A5B4FC]">L</span>
              </div>
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">LeaveFlow</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-extrabold tracking-tight mb-6 leading-[1.15]">
            Simplify Leave Management <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#818CF8] via-[#C084FC] to-[#60A5FA]">
              Across Your Organization
            </span>
          </h1>
          
          <p className="text-[#94A3B8] text-lg xl:text-xl leading-relaxed mb-10 max-w-xl">
            Streamline employee leave requests, approvals, attendance tracking, and workforce planning from one intelligent platform.
          </p>

          <div className="space-y-4 mb-16">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (i * 0.1) }}
                className="flex items-center gap-3 text-white/90 font-medium"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#4F46E5]/20 flex items-center justify-center border border-[#4F46E5]/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#818CF8]" />
                </div>
                {feature}
              </motion.div>
            ))}
          </div>

          {/* Floating UI Elements */}
          <div className="relative h-40 w-full mt-4">
            
            {/* Card 1: Approved Leaves */}
            <motion.div 
              animate={floatingAnimation}
              className="absolute left-0 top-0 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-64 z-20"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <Check className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Approved Leaves</h3>
                <p className="text-emerald-400 text-xs font-medium">12 this week</p>
              </div>
            </motion.div>

            {/* Card 2: Pending Requests */}
            <motion.div 
              animate={{ y: ["10px", "-10px", "10px"], transition: { duration: 7, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute left-[30%] top-16 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-64 z-10"
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Pending Requests</h3>
                <p className="text-amber-400 text-xs font-medium">4 require attention</p>
              </div>
            </motion.div>

            {/* Card 3: Team Availability */}
            <motion.div 
              animate={{ y: ["-5px", "15px", "-5px"], transition: { duration: 8, repeat: Infinity, ease: "easeInOut" } }}
              className="absolute left-[60%] top-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 w-64 z-30"
            >
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-medium text-sm">Team Availability</h3>
                <p className="text-blue-400 text-xs font-medium">92% present today</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {/* 
        ========================================================================
        RIGHT PANE: Form Container
        ======================================================================== 
      */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-20">
        <div className="w-full max-w-[500px]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
