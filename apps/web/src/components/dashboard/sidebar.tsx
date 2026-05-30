"use client";

import { LayoutDashboard, Bot, Users, Calendar } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { BackButton } from "./back-button";
import { cn } from "@repo/ui";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard/profit", label: "Profit", icon: LayoutDashboard },
    { to: "/dashboard/top-users", label: "Top Users", icon: Users },
    { to: "/dashboard/events", label: "Events", icon: Calendar },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#10131a] shadow-[1px_0_0_0_rgba(69,72,79,0.15)] flex flex-col p-6 space-y-8 z-50">
      <div>
        <BackButton />
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <Bot className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-lg font-black italic tracking-tighter">
            <span className="text-purple-400">Animal</span>{" "}
            <span className="text-white">Shelter</span>
          </h1>
          <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">
            Dashboard
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto pr-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all group",
                isActive
                  ? "text-purple-400 font-semibold bg-purple-500/10"
                  : "text-gray-400 hover:text-white hover:bg-[#161a21]",
              )}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 bg-[#161a21] rounded-xl flex items-center space-x-3">
        <img
          className="w-10 h-10 rounded-lg object-cover"
          src="https://picsum.photos/seed/darell/40/40"
          alt="User"
        />
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-bold text-white truncate">user</p>
          <p className="text-[10px] text-gray-400 truncate">Administrator</p>
        </div>
      </div>
    </aside>
  );
}
