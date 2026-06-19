import {
  LayoutDashboard,
  Users,
  Calendar,
  Home,
  PawPrint,
  FileText,
  Building2,
  Heart,
} from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "../../lib/cn";
import { CollapsibleReportsTree } from "./collapsible-reports-tree";

export function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/profit", label: "Profit", icon: LayoutDashboard },
    { to: "/top-users", label: "Top Users", icon: Users },
    { to: "/events", label: "Events", icon: Calendar },
    { to: "/animals", label: "Animals", icon: PawPrint },
    { to: "/contracts", label: "Contracts", icon: FileText },
    { to: "/clinics", label: "Clinics", icon: Building2 },
    { to: "/adoptions", label: "Adoptions", icon: Heart },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-[#10131a] shadow-[1px_0_0_0_rgba(69,72,79,0.15)] flex flex-col p-6 space-y-8 z-50">
      <Link
        to="/"
        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
      >
        <Home size={16} />
        <span>Back to Home</span>
      </Link>

      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
          <LayoutDashboard className="text-purple-400" size={20} />
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
        <CollapsibleReportsTree />
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;
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
