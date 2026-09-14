import { LogOut } from "lucide-react";
import { useLogout, useSession } from "../use-session";

export function UserCard() {
  const { user, isLoading } = useSession();
  const logout = useLogout();

  const fullName = user
    ? [user.name, user.lastName].filter(Boolean).join(" ")
    : "";

  return (
    <div className="p-4 bg-[#161a21] rounded-xl flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
        <span className="text-sm font-bold text-purple-400">
          {fullName ? fullName.charAt(0).toUpperCase() : "?"}
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <p className="text-xs font-bold text-white truncate">
          {isLoading ? "Loading..." : fullName || "Unknown user"}
        </p>
        <p className="text-[10px] text-gray-400 truncate">
          {user?.email ?? ""}
        </p>
      </div>
      <button
        type="button"
        onClick={logout}
        title="Sign out"
        aria-label="Sign out"
        className="text-gray-400 hover:text-white transition-colors shrink-0"
      >
        <LogOut size={16} />
      </button>
    </div>
  );
}
