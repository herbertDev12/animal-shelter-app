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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import type { TransportService } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchTransportServices, deleteTransportService } from "../services";

const statusBadgeClass: Record<string, string> = {
  Active: "bg-green-500/15 text-green-400",
  Inactive: "bg-gray-500/15 text-gray-400",
  Expired: "bg-red-500/15 text-red-400",
};

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

export function TransportServicesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      id_supplier: parseAsInteger,
      status: parseAsString,
      vehicle: parseAsString,
      transport_modality: parseAsString,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      id_supplier: filters.id_supplier ?? undefined,
      status: (filters.status as TransportService["status"]) ?? undefined,
      vehicle: filters.vehicle ?? undefined,
      transport_modality: filters.transport_modality ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: transportServices = [], isLoading } = useQuery({
    queryKey: ["transport-services", queryFilters],
    queryFn: () => fetchTransportServices(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransportService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transport-services"] });
      toast.success("Transport service deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete transport service.");
    },
  });

  const handleDelete = (transportService: TransportService) => {
    if (
      window.confirm(
        `Are you sure you want to delete transport service #${transportService.id}?`,
      )
    ) {
      deleteMutation.mutate(transportService.id);
    }
  };

  const columns = useMemo<ColumnDef<TransportService>[]>(
    () => [
      {
        header: "ID",
        accessorKey: "id",
        cell: ({ getValue }) => (
          <span className="font-semibold text-white">
            #{getValue() as number}
          </span>
        ),
      },
      { header: "Supplier", accessorKey: "id_supplier" },
      { header: "Vehicle", accessorKey: "vehicle" },
      { header: "Modality", accessorKey: "transport_modality" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue() as string;
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                statusBadgeClass[status] ?? "bg-gray-500/15 text-gray-400"
              }`}
            >
              {status}
            </span>
          );
        },
      },
      {
        header: "Start",
        accessorKey: "start_date",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        header: "End",
        accessorKey: "end_date",
        cell: ({ getValue }) => formatDate(getValue() as string),
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
                    to: "/transport-services/$transportServiceId/edit",
                    params: { transportServiceId: String(row.original.id) },
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
            Transport Services
          </h2>
          <p className="text-gray-400 mt-1">
            Manage transport services — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/transport-services/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Transport Service
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Supplier ID
          </label>
          <Input
            type="number"
            value={filters.id_supplier ?? ""}
            onChange={(e) =>
              setFilters({
                id_supplier: e.target.value ? Number(e.target.value) : null,
                offset: 0,
              })
            }
            placeholder="Supplier ID"
            className="w-40 bg-[#10131a] border-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Status
          </label>
          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) =>
              setFilters({ status: v === "all" ? null : v, offset: 0 })
            }
          >
            <SelectTrigger className="w-40 bg-[#10131a] border-gray-800 text-white">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent className="bg-[#10131a] border-gray-800 text-white">
              <SelectItem value="all">Any status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Vehicle
          </label>
          <Input
            value={filters.vehicle ?? ""}
            onChange={(e) =>
              setFilters({
                vehicle: e.target.value || null,
                offset: 0,
              })
            }
            placeholder="Vehicle"
            className="w-40 bg-[#10131a] border-gray-800 text-white"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Modality
          </label>
          <Input
            value={filters.transport_modality ?? ""}
            onChange={(e) =>
              setFilters({
                transport_modality: e.target.value || null,
                offset: 0,
              })
            }
            placeholder="Modality"
            className="w-40 bg-[#10131a] border-gray-800 text-white"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading transport services...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={transportServices} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {transportServices.length} · page{" "}
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
              disabled={transportServices.length < filters.limit}
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
