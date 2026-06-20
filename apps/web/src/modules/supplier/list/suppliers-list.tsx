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
import type { Supplier } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchSuppliers, deleteSupplier } from "../services";

export function SuppliersList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      name: parseAsString,
      type: parseAsString,
      province: parseAsString,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      name: filters.name ?? undefined,
      type: (filters.type as Supplier["type"]) ?? undefined,
      province: filters.province ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ["suppliers", queryFilters],
    queryFn: () => fetchSuppliers(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast.success("Supplier deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete supplier.");
    },
  });

  const handleDelete = (supplier: Supplier) => {
    if (
      window.confirm(
        `Are you sure you want to delete supplier #${supplier.id}?`,
      )
    ) {
      deleteMutation.mutate(supplier.id);
    }
  };

  const columns = useMemo<ColumnDef<Supplier>[]>(
    () => [
      { header: "Name", accessorKey: "name" },
      { header: "Type", accessorKey: "type" },
      { header: "Contact", accessorKey: "contact_name" },
      { header: "Phone", accessorKey: "phone" },
      { header: "Province", accessorKey: "province" },
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
                    to: "/suppliers/$supplierId/edit",
                    params: { supplierId: String(row.original.id) },
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
          <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-gray-400 mt-1">
            Manage suppliers — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/suppliers/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Supplier
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Name
          </label>
          <Input
            value={filters.name ?? ""}
            onChange={(e) =>
              setFilters({ name: e.target.value || null, offset: 0 })
            }
            placeholder="Search by name"
            className="w-48 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Type
          </label>
          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) =>
              setFilters({ type: v === "all" ? null : v, offset: 0 })
            }
          >
            <SelectTrigger className="w-40 bg-[#10131a] border-gray-800 text-white">
              <SelectValue placeholder="Any type" />
            </SelectTrigger>
            <SelectContent className="bg-[#10131a] border-gray-800 text-white">
              <SelectItem value="all">Any type</SelectItem>
              <SelectItem value="Veterinarian">Veterinarian</SelectItem>
              <SelectItem value="Food Company">Food Company</SelectItem>
              <SelectItem value="Service Company">Service Company</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Province
          </label>
          <Input
            value={filters.province ?? ""}
            onChange={(e) =>
              setFilters({ province: e.target.value || null, offset: 0 })
            }
            placeholder="Search by province"
            className="w-48 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading suppliers...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={suppliers} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {suppliers.length} · page{" "}
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
              disabled={suppliers.length < filters.limit}
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
