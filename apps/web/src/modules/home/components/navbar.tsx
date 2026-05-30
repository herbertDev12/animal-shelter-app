import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-20 z-50 bg-[#0b0e14]/50 backdrop-blur-md border-b border-white/5 px-8 flex items-center justify-between">
      <div className="flex items-center space-x-12">
        <Link
          href="/"
          className="flex items-center space-x-2 group text-2xl font-bold tracking-tight"
        >
          <span className="text-purple-500">SocIA</span>
          <span className="text-white">Backoffice</span>
        </Link>

        <div className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className="text-white text-sm font-medium hover:text-purple-400 transition-colors relative after:absolute after:bottom-[-26px] after:left-0 after:right-0 after:h-[2px] after:bg-purple-500"
          >
            Home
          </Link>
          <Link
            href="/dashboard/profit"
            className="text-gray-400 text-sm font-medium hover:text-white transition-colors"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="flex items-center">
        <Link
          href={String(process.env.SocIA_URL)}
          className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-all active:scale-95"
        >
          Go to Agent
        </Link>
      </div>
    </nav>
  );
}
