import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui";
import type { ActivitySchedule } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchActivitySchedules, deleteActivitySchedule } from "../services";

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ActivitySchedulesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      id_animal: parseAsInteger,
      id_contract: parseAsInteger,
      activity_type: parseAsString,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      id_animal: filters.id_animal ?? undefined,
      id_contract: filters.id_contract ?? undefined,
      activity_type: filters.activity_type ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["activity-schedules", queryFilters],
    queryFn: () => fetchActivitySchedules(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivitySchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activity-schedules"] });
      toast.success("Activity schedule deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete activity schedule.");
    },
  });

  const handleDelete = (schedule: ActivitySchedule) => {
    if (
      window.confirm(
        `Are you sure you want to delete activity schedule #${schedule.id_schedule}?`,
      )
    ) {
      deleteMutation.mutate(schedule.id_schedule);
    }
  };

  const columns = useMemo<ColumnDef<ActivitySchedule>[]>(
    () => [
      {
        header: "Animal",
        cell: ({ row }) => row.original.animal_name ?? row.original.id_animal,
      },
      { header: "Contract", accessorKey: "id_contract" },
      {
        header: "Type",
        accessorKey: "activity_type",
        cell: ({ getValue }) => (getValue() as string) ?? "—",
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        header: "Duration",
        accessorKey: "duration_days",
        cell: ({ getValue }) => `${getValue() as number} d`,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <Popover>
            <PopoverTrigger
              className="p-1.5 rounded-md text-gray-400 hover:bg-[#22262f] hover:text-white transition-colors"
              aria-label="Open actions menu"
            >
              <MoreVertical className="h-4 w-4" />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-40 p-1 bg-[#10131a] border-gray-800 text-white"
            >
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/activity-schedules/$scheduleId/edit",
                    params: {
                      scheduleId: String(row.original.id_schedule),
                    },
                  })
                }
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-200 hover:bg-[#1f2937] transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(row.original)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Activity Schedules
          </h2>
          <p className="text-gray-400 mt-1">
            Manage activity schedules — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/activity-schedules/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Activity Schedule
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Animal ID
          </label>
          <Input
            type="number"
            min={1}
            value={filters.id_animal ?? ""}
            onChange={(e) =>
              setFilters({
                id_animal:
                  e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="Any"
            className="w-28 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Contract ID
          </label>
          <Input
            type="number"
            min={1}
            value={filters.id_contract ?? ""}
            onChange={(e) =>
              setFilters({
                id_contract:
                  e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="Any"
            className="w-28 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Activity type
          </label>
          <Input
            type="text"
            value={filters.activity_type ?? ""}
            onChange={(e) =>
              setFilters({
                activity_type: e.target.value === "" ? null : e.target.value,
                offset: 0,
              })
            }
            placeholder="Any"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading activity schedules...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={schedules} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {schedules.length} · page{" "}
              {Math.floor(filters.offset / filters.limit) + 1}
            </span>
            <Button
              onClick={() =>
                setFilters({
                  offset: Math.max(0, filters.offset - filters.limit),
                })
              }
              disabled={filters.offset === 0}
              className="px-3 py-1 rounded bg-[#10131a] border border-gray-800 hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prev
            </Button>
            <Button
              onClick={() =>
                setFilters({ offset: filters.offset + filters.limit })
              }
              disabled={schedules.length < filters.limit}
              className="px-3 py-1 rounded bg-[#10131a] border border-gray-800 hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
