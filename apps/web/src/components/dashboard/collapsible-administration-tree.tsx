import { ChevronDown, ChevronRightIcon, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui";
import { cn } from "../../lib/cn";
import { useState } from "react";

export function CollapsibleAdministrationTree() {
  const location = useLocation();
  const isAdministrationActive =
    location.pathname.startsWith("/administration");
  const [isOpen, setIsOpen] = useState(isAdministrationActive);

  const administrationRoutes = [
    { to: "/administration/users", label: "Users" },
    { to: "/administration/roles", label: "Roles" },
  ];

  return (
    <Collapsible defaultOpen={isAdministrationActive}>
      <CollapsibleTrigger
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-3 py-2.5 transition-all group",
          "text-gray-400 hover:text-white hover:bg-[#161a21]",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <ShieldCheck size={20} />
          <span className="text-sm">Administration</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-1">
        {administrationRoutes.map((route) => {
          const isActive = location.pathname === route.to;
          return (
            <Link
              key={route.to}
              to={route.to}
              className={cn(
                "flex items-center space-x-3 rounded-lg px-3 py-2 pl-8 transition-all group",
                isActive
                  ? "text-purple-400 font-semibold bg-purple-500/10"
                  : "text-gray-400 hover:text-white hover:bg-[#161a21]",
              )}
            >
              <span className="text-sm">{route.label}</span>
            </Link>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}
