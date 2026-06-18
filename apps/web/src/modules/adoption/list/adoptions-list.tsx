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
import type { Adoption } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchAdoptions, deleteAdoption } from "../services";

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

export function AdoptionsList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      id_animal: parseAsInteger,
      minPrice: parseAsInteger,
      maxPrice: parseAsInteger,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      id_animal: filters.id_animal ?? undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: adoptions = [], isLoading } = useQuery({
    queryKey: ["adoptions", queryFilters],
    queryFn: () => fetchAdoptions(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdoption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adoptions"] });
      toast.success("Adoption deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete adoption.");
    },
  });

  const handleDelete = (adoption: Adoption) => {
    if (
      window.confirm(
        `Are you sure you want to delete adoption #${adoption.id}?`,
      )
    ) {
      deleteMutation.mutate(adoption.id);
    }
  };

  const columns = useMemo<ColumnDef<Adoption>[]>(
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
      { header: "Animal", accessorKey: "id_animal" },
      {
        header: "Adoption date",
        accessorKey: "adoption_date",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        header: "Price",
        accessorKey: "adoption_price",
        cell: ({ getValue }) => {
          const price = getValue() as number | undefined;
          return price != null ? `$${price}` : "—";
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
                    to: "/adoptions/$adoptionId/edit",
                    params: { adoptionId: String(row.original.id) },
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
          <h2 className="text-3xl font-bold tracking-tight">Adoptions</h2>
          <p className="text-gray-400 mt-1">
            Manage adoptions — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/adoptions/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Adoption
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
            Min price
          </label>
          <Input
            type="number"
            min={0}
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              setFilters({
                minPrice: e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="0"
            className="w-24 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Max price
          </label>
          <Input
            type="number"
            min={0}
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              setFilters({
                maxPrice: e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="Any"
            className="w-24 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading adoptions...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={adoptions} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {adoptions.length} · page{" "}
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
              disabled={adoptions.length < filters.limit}
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
