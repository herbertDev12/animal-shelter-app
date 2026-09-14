import { LayoutDashboard } from "lucide-react";
import { LoginForm } from "./forms/login-form";

interface LoginPageProps {
  redirectTo?: string;
}

export function LoginPage({ redirectTo }: LoginPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0e14] px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <LayoutDashboard className="text-purple-400" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic tracking-tighter">
              <span className="text-purple-400">Animal</span>{" "}
              <span className="text-white">Shelter</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
              Dashboard
            </p>
          </div>
        </div>

        <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-6 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Sign in</h2>
            <p className="text-sm text-gray-400">
              Use your shelter account to continue.
            </p>
          </div>
          <LoginForm redirectTo={redirectTo} />
        </div>
      </div>
    </div>
  );
}
