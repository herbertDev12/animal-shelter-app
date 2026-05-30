"use client";

import { ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { DashboardEvent } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface EventTimelineProps {
  events?: DashboardEvent[];
  isLoading?: boolean;
  selectedEventId?: string | null;
  onSelectEvent?: (id: string) => void;
  onEditEvent?: (event: DashboardEvent) => void;
  onDeleteEvent?: (id: string) => void;
}

export function EventTimeline({
  events = [],
  isLoading,
  selectedEventId,
  onSelectEvent,
  onEditEvent,
  onDeleteEvent,
}: EventTimelineProps) {
  const activeEventId = selectedEventId;

  return (
    <div className="mb-10 bg-[#10131a] p-6 rounded-2xl relative">
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black text-[#a9abb3] uppercase tracking-widest">
          Event Timeline
        </span>
        <div className="flex gap-2">
          <button className="p-1 text-[#a9abb3] hover:text-[#ecedf6]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-1 text-[#a9abb3] hover:text-[#ecedf6]">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="flex gap-4 relative overflow-x-auto py-6 hide-scrollbar">
        {/* Timeline Base Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#45484f]/10 -translate-y-1/2"></div>

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="flex-1 min-w-[120px] relative">
              <div className="h-24 w-full flex flex-col items-center justify-center">
                <Skeleton className="w-4 h-4 rounded-full bg-[#22262f] z-10" />
                <div className="mt-4 text-center flex flex-col items-center gap-1.5">
                  <Skeleton className="h-2 w-10 bg-[#22262f]" />
                  <Skeleton className="h-3 w-16 bg-[#22262f]" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            {events.map((event) => {
              const isActive = event.id === activeEventId;

              return (
                <div
                  key={event.id}
                  className="flex-1 min-w-[120px] relative group cursor-pointer"
                  onClick={() => onSelectEvent?.(event.id)}
                >
                  {/* Hover Actions */}
                  <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditEvent?.(event);
                      }}
                      className="p-1.5 bg-[#22262f] hover:bg-[#cc97ff] hover:text-[#10131a] text-[#a9abb3] rounded-md shadow-sm transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteEvent?.(event.id);
                      }}
                      className="p-1.5 bg-[#22262f] hover:bg-red-500 hover:text-white text-[#a9abb3] rounded-md shadow-sm transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="h-24 w-full flex flex-col items-center justify-center">
                    {isActive ? (
                      <div className="w-6 h-6 rounded-full bg-[#cc97ff] border-4 border-[#0b0e14] shadow-[0_0_15px_rgba(204,151,255,0.4)] z-10 scale-110"></div>
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-[#22262f] border-2 border-[#45484f] group-hover:border-[#cc97ff] transition-all z-10"></div>
                    )}
                    <div className="mt-4 text-center">
                      <p
                        className={
                          isActive
                            ? "text-[10px] text-[#cc97ff] font-bold uppercase"
                            : "text-[10px] text-[#a9abb3] font-medium uppercase"
                        }
                      >
                        {format(event.date, "MMM dd")}
                      </p>
                      <p
                        className={
                          isActive
                            ? "text-xs font-extrabold text-[#ecedf6]"
                            : "text-xs font-bold text-[#ecedf6]"
                        }
                      >
                        {event.name}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && (
              <div className="text-center w-full text-sm text-[#a9abb3] py-4">No events found.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
