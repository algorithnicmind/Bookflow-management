import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-primary)]">
      {/* Left side - Branding/Visuals */}
      <div className="hidden lg:flex w-full lg:w-1/2 relative overflow-hidden bg-[#0b0c16] items-center justify-center p-12">
        {/* Dynamic Animated Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[10%] left-[20%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" />
          <div className="absolute bottom-[10%] right-[20%] w-[35rem] h-[35rem] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="z-10 text-left max-w-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 shadow-lg shadow-[var(--primary-glow)] mb-8">
            <span className="text-3xl font-bold text-white">L</span>
          </div>
          <h1 className="text-5xl font-extrabold text-white mb-6 leading-tight">
            Manage your team's time off with <span className="gradient-text">LeaveFlow</span>.
          </h1>
          <p className="text-[#94A3B8] text-lg mb-12">
            The modern, intuitive, and frictionless way to request, approve, and track employee leaves across your entire organization.
          </p>
          
          {/* Glassmorphism Abstract Element */}
          <div className="w-full p-6 rounded-2xl glass-card-static border border-white/10 relative overflow-hidden flex items-center justify-start">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent z-0"></div>
            <div className="flex gap-5 items-center z-10 w-full">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-white font-medium text-lg">Leave Approved</h3>
                  <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">Just now</span>
                </div>
                <p className="text-[#94A3B8] text-sm">Your time off request (Dec 24 - Jan 2) has been approved by your manager.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden dark:bg-[#080910] bg-white">
         {/* Mobile background flair */}
         <div className="absolute lg:hidden top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[var(--primary-glow)] to-transparent z-0 pointer-events-none" />
         
         <div className="w-full max-w-[420px] z-10">
           <LoginForm />
         </div>
      </div>
    </div>
  );
}
