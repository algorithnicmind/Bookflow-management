import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[var(--bg-primary)]">
      {/* Left side - Branding/Visuals */}
      <div className="hidden lg:flex w-full lg:w-[55%] relative overflow-hidden bg-[#06070e] items-center justify-center p-16">
        {/* Multi-layer animated background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[35rem] h-[35rem] bg-indigo-600/15 rounded-full blur-[130px] animate-pulse-glow" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[30rem] h-[30rem] bg-violet-600/12 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[25rem] h-[25rem] bg-blue-600/8 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '4s' }} />
          <div className="absolute top-[20%] right-[15%] w-[15rem] h-[15rem] bg-pink-500/8 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        </div>

        {/* Dot grid texture */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* Content */}
        <div className="z-10 text-left max-w-lg w-full relative">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25 mb-10">
            <span className="text-2xl font-bold text-white">L</span>
          </div>

          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider">Enterprise Ready</span>
          </div>

          {/* Headline */}
          <h1 className="text-[2.75rem] leading-[1.15] font-extrabold text-white mb-5 tracking-tight">
            Streamline your<br />
            team&apos;s time off<br />
            with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">LeaveFlow</span>
          </h1>

          <p className="text-white/40 text-base leading-relaxed mb-10 max-w-md">
            The modern platform to request, approve, and track employee leaves — built for teams that value clarity and speed.
          </p>

          {/* Floating UI Preview Cards */}
          <div className="relative w-full">
            {/* Main notification card */}
            <div className="w-full p-5 rounded-2xl bg-white/[0.04] backdrop-blur-md border border-white/[0.07] shadow-xl shadow-black/20">
              <div className="flex gap-4 items-start">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="text-white font-semibold text-sm">Leave Approved</h3>
                    <span className="text-[10px] text-emerald-400/80 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">Just now</span>
                  </div>
                  <p className="text-white/35 text-xs leading-relaxed">Your vacation request (Dec 24 – Jan 2) has been approved by Sarah K.</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-3">
              {[
                { label: 'Casual', value: '8', sub: 'days left' },
                { label: 'Sick', value: '5', sub: 'days left' },
                { label: 'Earned', value: '12', sub: 'days left' },
              ].map((stat) => (
                <div key={stat.label} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
                  <p className="text-xl font-bold text-white mb-0.5">{stat.value}</p>
                  <p className="text-[10px] text-white/30 uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Team activity bar */}
            <div className="mt-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {['bg-indigo-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500'].map((color, i) => (
                    <div key={i} className={`w-7 h-7 rounded-full ${color} border-2 border-[#06070e] flex items-center justify-center`}>
                      <span className="text-[9px] font-bold text-white">{['AK', 'SR', 'MJ', 'PD'][i]}</span>
                    </div>
                  ))}
                </div>
                <span className="text-xs text-white/35">+12 team members</span>
              </div>
              <span className="text-[10px] text-white/25 font-medium">Active now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden bg-[#080910]">
         {/* Animated background orbs */}
         <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
           <div className="absolute top-[-20%] right-[-10%] w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse-glow" />
           <div className="absolute bottom-[-15%] left-[-10%] w-[25rem] h-[25rem] bg-purple-600/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '3s' }} />
           <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[20rem] h-[20rem] bg-blue-600/5 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
         </div>

         {/* Subtle grid pattern */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
           style={{
             backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
             backgroundSize: '60px 60px',
           }}
         />
         
         {/* Glass form container */}
         <div className="w-full max-w-[440px] z-10 relative">
           <div className="absolute -inset-px rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-white/10 pointer-events-none" />
           <div className="relative bg-[#0f1117] border border-white/[0.12] rounded-3xl p-8 sm:p-10 shadow-2xl">
             <LoginForm />
           </div>
         </div>
      </div>
    </div>
  );
}
