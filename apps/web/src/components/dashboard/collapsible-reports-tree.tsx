import { ChevronDown, ChevronRightIcon, ClipboardList } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@repo/ui";
import { cn } from "../../lib/cn";
import { useState } from "react";

export function CollapsibleReportsTree() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isReportsActive = location.pathname.startsWith("/reports");

  const reportRoutes = [
    {
      to: "/reports/reconciled-veterinarian-contracts",
      label: "Reconciled Veterinarians",
    },
    {
      to: "/reports/active-veterinarians",
      label: "Active Veterinarians",
    },
    {
      to: "/reports/animal-care-schedule",
      label: "Animal Care Schedule",
    },
    {
      to: "/reports/revenue-plan",
      label: "Revenue Plan",
    },
    {
      to: "/reports/food-supplier-contracts",
      label: "Food Suppliers",
    },
    {
      to: "/reports/complementary-service-contracts",
      label: "Complementary Services",
    },
  ];

  return (
    <Collapsible defaultOpen={isReportsActive} className="w-full">
      <CollapsibleTrigger
        className={cn(
          "flex items-center justify-between w-full px-3 py-2.5 rounded-lg transition-all group text-left cursor-pointer",
          "text-gray-400 hover:text-white hover:bg-[#161a21]",
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-3">
          <ClipboardList size={20} />
          <span className="text-sm">Reports</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
        ) : (
          <ChevronRightIcon className="w-4 h-4 text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-90" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-1 space-y-1">
        {reportRoutes.map((route) => {
          const isActive = location.pathname === route.to;
          return (
            <Link
              key={route.to}
              to={route.to}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all group pl-8",
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
