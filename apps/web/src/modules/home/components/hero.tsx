import { Bot } from "lucide-react";

export function Hero() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 pt-32">
      <div className="relative mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="p-10 rounded-[2.5rem] bg-linear-to-br from-purple-500/20 to-blue-500/10 border border-white/10 backdrop-blur-3xl shadow-2xl shadow-purple-500/20 ring-1 ring-white/20">
          <Bot size={120} className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
        </div>
        <div className="absolute -bottom-4 -right-1 w-10 h-10 bg-purple-500 rounded-full border-4 border-[#0b0e14] shadow-lg animate-pulse" />
      </div>

      <h1 className="text-6xl md:text-8xl font-black text-center tracking-tight text-white mb-6 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
        Welcome to <br />
        <span className="bg-clip-text text-transparent bg-linear-to-r from-purple-400 via-blue-400 to-indigo-400">
          SocIA Backoffice
        </span>
      </h1>
      <p className="max-w-xl text-center text-gray-400 text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-2 delay-300 duration-700">
        Empowering your business with AI-driven insights and real-time social management tools.
      </p>
    </div>
  );
}
