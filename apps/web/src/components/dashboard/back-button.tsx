"use client";

import { Link } from "@tanstack/react-router";
import { Button } from "@repo/ui";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  return (
    <Link to="/" activeProps={{ className: "font-bold" }}>
      <Button
        variant="outline"
        size="sm"
        className="w-full px-4 py-2 h-auto gap-3 text-gray-400 hover:text-white border-white/5 bg-[#161a21]/50 backdrop-blur-xl hover:bg-purple-500/10 hover:border-purple-500/30 transition-all active:scale-95 group rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] justify-start"
      >
        <div className="flex items-center justify-center p-1 rounded-lg bg-gray-400/10 group-hover:bg-purple-500/20 transition-colors">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 group-hover:text-purple-400" />
        </div>
        <span className="text-sm font-semibold tracking-wide">
          Back to Home
        </span>
      </Button>
    </Link>
  );
}
