import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryStates, parseAsString, parseAsInteger } from "nuqs";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui";
import type { Contract } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchContracts, deleteContract } from "../services";

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

export function ContractsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      contract_category: parseAsString,
      status: parseAsString,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      contract_category:
        (filters.contract_category as Contract["contract_category"]) ??
        undefined,
      status: (filters.status as Contract["status"]) ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts", queryFilters],
    queryFn: () => fetchContracts(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      toast.success("Contract deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete contract.");
    },
  });

  const handleDelete = (contract: Contract) => {
    if (
      window.confirm(
        `Are you sure you want to delete contract #${contract.id}?`,
      )
    ) {
      deleteMutation.mutate(contract.id);
    }
  };

  const columns = useMemo<ColumnDef<Contract>[]>(
    () => [
      { header: "Supplier", accessorKey: "id_supplier" },
      { header: "Category", accessorKey: "contract_category" },
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
        header: "Base price",
        accessorKey: "base_price",
        cell: ({ getValue }) => `$${getValue() as number}`,
      },
      {
        header: "Surcharge",
        accessorKey: "surcharge",
        cell: ({ getValue }) => `$${getValue() as number}`,
      },
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
                    to: "/contracts/$contractId/edit",
                    params: { contractId: String(row.original.id) },
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
          <h2 className="text-3xl font-bold tracking-tight">Contracts</h2>
          <p className="text-gray-400 mt-1">
            Manage supplier contracts — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/contracts/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Contract
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Category
          </label>
          <Select
            value={filters.contract_category ?? "all"}
            onValueChange={(v) =>
              setFilters({
                contract_category: v === "all" ? null : v,
                offset: 0,
              })
            }
          >
            <SelectTrigger className="w-40 bg-[#10131a] border-gray-800 text-white">
              <SelectValue placeholder="Any category" />
            </SelectTrigger>
            <SelectContent className="bg-[#10131a] border-gray-800 text-white">
              <SelectItem value="all">Any category</SelectItem>
              <SelectItem value="Veterinarian">Veterinarian</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Service">Service</SelectItem>
            </SelectContent>
          </Select>
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
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading contracts...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={contracts} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {contracts.length} · page{" "}
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
              disabled={contracts.length < filters.limit}
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
