import Link from "next/link";
import { Monitor, LayoutPanelLeft } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0b0e14]/30 backdrop-blur-md px-12 py-8 flex flex-col md:flex-row items-center justify-between">
      <div className="flex flex-col mb-6 md:mb-0">
        <h3 className="text-lg font-bold text-white mb-1 tracking-tight">SocIA AI</h3>
        <p className="text-xs text-gray-500 font-medium">© 2026 SocIA AI. All rights reserved.</p>
      </div>

      <div className="flex items-center space-x-10 text-xs text-gray-400 font-medium tracking-wide first:pl-0">
        <Link href="#" className="hover:text-purple-400 transition-colors">
          Privacy Policy
        </Link>
        <Link href="#" className="hover:text-purple-400 transition-colors">
          Terms of Service
        </Link>
        <Link href="#" className="hover:text-purple-400 transition-colors">
          Contact
        </Link>
      </div>

      <div className="flex items-center space-x-4 mt-6 md:mt-0">
        <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer border border-white/5">
          <Monitor size={18} className="text-gray-400 group-hover:text-purple-400" />
        </div>
        <div className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer border border-white/5">
          <LayoutPanelLeft size={18} className="text-gray-400 group-hover:text-purple-400" />
        </div>
      </div>
    </footer>
  );
}
