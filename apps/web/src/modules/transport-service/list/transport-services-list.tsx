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
import {
  ContractStatus,
  ContractStatusLabel,
  type TransportService,
} from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchTransportServices, deleteTransportService } from "../services";
import { shortId } from "@/lib/utils/short-id";
import { FkFilterSelect } from "@/components/fields/fk-filter-select";
import { fetchSupplierOptions } from "@/modules/supplier/services";
import { StatusBadge } from "@/components/status-badge";
import {
  CONTRACT_STATUS_BADGE_CLASS,
  CONTRACT_STATUS_OPTIONS,
} from "@/lib/enum-ui";

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
      id_supplier: parseAsString,
      status: parseAsInteger,
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
        `Are you sure you want to delete transport service #${shortId(transportService.id)}?`,
      )
    ) {
      deleteMutation.mutate(transportService.id);
    }
  };

  const columns = useMemo<ColumnDef<TransportService>[]>(
    () => [
      { header: "Supplier", accessorKey: "id_supplier" },
      { header: "Vehicle", accessorKey: "vehicle" },
      { header: "Modality", accessorKey: "transport_modality" },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ getValue }) => {
          const status = getValue() as ContractStatus;
          return (
            <StatusBadge
              label={ContractStatusLabel[status]}
              className={CONTRACT_STATUS_BADGE_CLASS[status]}
            />
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
                    params: { transportServiceId: row.original.id },
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
            Supplier
          </label>
          <FkFilterSelect
            value={filters.id_supplier}
            onChange={(value) => setFilters({ id_supplier: value, offset: 0 })}
            queryKey={["suppliers", "options"]}
            queryFn={fetchSupplierOptions}
            placeholder="Any supplier"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Status
          </label>
          <Select
            value={filters.status != null ? String(filters.status) : "all"}
            onValueChange={(v) =>
              setFilters({ status: v === "all" ? null : Number(v), offset: 0 })
            }
          >
            <SelectTrigger className="w-40 bg-[#10131a] border-gray-800 text-white">
              <SelectValue placeholder="Any status" />
            </SelectTrigger>
            <SelectContent className="bg-[#10131a] border-gray-800 text-white">
              <SelectItem value="all">Any status</SelectItem>
              {CONTRACT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={String(option.value)}>
                  {option.label}
                </SelectItem>
              ))}
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
