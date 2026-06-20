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
import type { Veterinarian } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchVeterinarians, deleteVeterinarian } from "../services";

export function VeterinariansList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [filters, setFilters] = useQueryStates(
    {
      id_clinic: parseAsInteger,
      specialty: parseAsString,
      modality: parseAsString,
      province: parseAsString,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      id_clinic: filters.id_clinic ?? undefined,
      specialty: filters.specialty ?? undefined,
      modality: filters.modality ?? undefined,
      province: filters.province ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: veterinarians = [], isLoading } = useQuery({
    queryKey: ["veterinarians", queryFilters],
    queryFn: () => fetchVeterinarians(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVeterinarian,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["veterinarians"] });
      toast.success("Veterinarian deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete veterinarian.");
    },
  });

  const handleDelete = (veterinarian: Veterinarian) => {
    if (
      window.confirm(`Are you sure you want to delete "${veterinarian.name}"?`)
    ) {
      deleteMutation.mutate(veterinarian.id);
    }
  };

  const columns = useMemo<ColumnDef<Veterinarian>[]>(
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
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ getValue }) => (
          <span className="font-semibold text-white">
            {getValue() as string}
          </span>
        ),
      },
      {
        header: "Clinic",
        accessorKey: "clinic_name",
        cell: ({ row }) => row.original.clinic_name ?? row.original.id_clinic,
      },
      {
        header: "Specialty",
        accessorKey: "specialty",
        cell: ({ row }) => row.original.specialty ?? "—",
      },
      {
        header: "Province",
        accessorKey: "province",
        cell: ({ row }) => row.original.province ?? "—",
      },
      {
        header: "Phone",
        accessorKey: "phone",
        cell: ({ row }) => row.original.phone ?? "—",
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
                    to: "/veterinarians/$veterinarianId/edit",
                    params: { veterinarianId: String(row.original.id) },
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
          <h2 className="text-3xl font-bold tracking-tight">Veterinarians</h2>
          <p className="text-gray-400 mt-1">
            Manage veterinarians — create, edit, filter and remove.
          </p>
        </div>
        <Link to="/veterinarians/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Veterinarian
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Clinic ID
          </label>
          <Input
            type="number"
            value={filters.id_clinic ?? ""}
            onChange={(e) =>
              setFilters({
                id_clinic:
                  e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="Any clinic"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Specialty
          </label>
          <Input
            value={filters.specialty ?? ""}
            onChange={(e) =>
              setFilters({ specialty: e.target.value || null, offset: 0 })
            }
            placeholder="Any specialty"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Modality
          </label>
          <Input
            value={filters.modality ?? ""}
            onChange={(e) =>
              setFilters({ modality: e.target.value || null, offset: 0 })
            }
            placeholder="Any modality"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
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
            placeholder="Any province"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading veterinarians...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={veterinarians} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {veterinarians.length} · page{" "}
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
              disabled={veterinarians.length < filters.limit}
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
