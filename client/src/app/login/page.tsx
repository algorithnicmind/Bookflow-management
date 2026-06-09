import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Animated Background for Login */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40rem] h-[40rem] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" />
        <div className="absolute bottom-[10%] right-[20%] w-[35rem] h-[35rem] bg-pink-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '4s' }} />
      </div>
      
      <div className="z-10 w-full relative">
        <LoginForm />
      </div>
    </div>
  );
}
