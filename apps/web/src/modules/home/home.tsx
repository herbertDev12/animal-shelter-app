import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col font-sans selection:bg-purple-500/30 overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <Navbar />

      <main className="flex-1 flex flex-col relative z-10 w-full max-w-7xl mx-auto px-6 h-full min-h-[calc(100vh-80px)]">
        <Hero />
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
