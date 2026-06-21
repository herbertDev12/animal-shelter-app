import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryStates, parseAsInteger } from "nuqs";
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
import type { Activity } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchActivities, deleteActivity } from "../services";

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

export function ActivitiesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      id_animal: parseAsInteger,
      id_service: parseAsInteger,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      id_animal: filters.id_animal ?? undefined,
      id_service: filters.id_service ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["activities", queryFilters],
    queryFn: () => fetchActivities(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success("Activity deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete activity.");
    },
  });

  const handleDelete = (activity: Activity) => {
    if (
      window.confirm(
        `Are you sure you want to delete activity #${activity.id_activity}?`,
      )
    ) {
      deleteMutation.mutate(activity.id_activity);
    }
  };

  const columns = useMemo<ColumnDef<Activity>[]>(
    () => [
      {
        header: "Animal",
        cell: ({ row }) => row.original.animal_name ?? row.original.id_animal,
      },
      {
        header: "Service",
        cell: ({ row }) => row.original.service_name ?? row.original.id_service,
      },
      {
        header: "Date",
        accessorKey: "date",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        header: "Time",
        accessorKey: "time",
        cell: ({ getValue }) => (getValue() as string) ?? "—",
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ getValue }) => (getValue() as string) ?? "—",
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
                    to: "/activities/$activityId/edit",
                    params: {
                      activityId: String(row.original.id_activity),
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
          <h2 className="text-3xl font-bold tracking-tight">Activities</h2>
          <p className="text-gray-400 mt-1">
            Manage activities — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/activities/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Activity
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
            Service ID
          </label>
          <Input
            type="number"
            min={1}
            value={filters.id_service ?? ""}
            onChange={(e) =>
              setFilters({
                id_service:
                  e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="Any"
            className="w-28 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading activities...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={activities} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {activities.length} · page{" "}
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
              disabled={activities.length < filters.limit}
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
