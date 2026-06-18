import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import type { Animal } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { fetchAnimals, deleteAnimal } from "../services";
import { CreateAnimalForm } from "../forms/create-animal";
import { EditAnimalForm } from "../forms/edit-animal";

const statusBadgeClass: Record<string, string> = {
  available: "bg-green-500/15 text-green-400",
  adopted: "bg-purple-500/15 text-purple-400",
  reserved: "bg-yellow-500/15 text-yellow-400",
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

export function AnimalsList() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const [filters, setFilters] = useQueryStates(
    {
      species: parseAsString,
      breed: parseAsString,
      minAge: parseAsInteger,
      maxAge: parseAsInteger,
      limit: parseAsInteger.withDefault(10),
      offset: parseAsInteger.withDefault(0),
    },
    { shallow: false },
  );

  const queryFilters = useMemo(
    () => ({
      species: filters.species ?? undefined,
      breed: filters.breed ?? undefined,
      minAge: filters.minAge ?? undefined,
      maxAge: filters.maxAge ?? undefined,
      limit: filters.limit,
      offset: filters.offset,
    }),
    [filters],
  );

  const { data: animals = [], isLoading } = useQuery({
    queryKey: ["animals", queryFilters],
    queryFn: () => fetchAnimals(queryFilters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAnimal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animals"] });
      toast.success("Animal deleted successfully!");
    },
    onError: () => {
      toast.error("Failed to delete animal.");
    },
  });

  const handleDelete = (animal: Animal) => {
    if (window.confirm(`Are you sure you want to delete "${animal.name}"?`)) {
      deleteMutation.mutate(animal.id);
    }
  };

  const columns = useMemo<ColumnDef<Animal>[]>(
    () => [
      { header: "ID", accessorKey: "id" },
      {
        header: "Name",
        accessorKey: "name",
        cell: ({ getValue }) => (
          <span className="font-semibold text-white">
            {getValue() as string}
          </span>
        ),
      },
      { header: "Species", accessorKey: "species" },
      {
        header: "Breed",
        accessorKey: "breed",
        cell: ({ getValue }) => (getValue() as string) || "—",
      },
      {
        header: "Age",
        accessorKey: "age",
        cell: ({ getValue }) => {
          const age = getValue() as number | undefined;
          return age != null ? `${age} yr` : "—";
        },
      },
      {
        header: "Birth date",
        accessorKey: "birth_date",
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        header: "Weight",
        accessorKey: "weight",
        cell: ({ getValue }) => {
          const weight = getValue() as number | undefined;
          return weight != null ? `${weight} kg` : "—";
        },
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
        header: "Entry date",
        accessorKey: "entry_date",
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
                onClick={() => setEditingAnimal(row.original)}
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
    [],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Animals</h2>
          <p className="text-gray-400 mt-1">
            Manage the shelter's animals — create, edit, filter and remove.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingAnimal(null);
            setShowCreate((prev) => !prev);
          }}
          className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Animal
        </Button>
      </div>

      {showCreate && (
        <CreateAnimalForm
          onCreated={() => setShowCreate(false)}
          onCancel={() => setShowCreate(false)}
        />
      )}

      {editingAnimal && (
        <EditAnimalForm
          animal={editingAnimal}
          onSaved={() => setEditingAnimal(null)}
          onCancel={() => setEditingAnimal(null)}
        />
      )}

      {/* Filters */}
      <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 p-4 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Species
          </label>
          <Input
            value={filters.species ?? ""}
            onChange={(e) =>
              setFilters({ species: e.target.value || null, offset: 0 })
            }
            placeholder="Any species"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Breed
          </label>
          <Input
            value={filters.breed ?? ""}
            onChange={(e) =>
              setFilters({ breed: e.target.value || null, offset: 0 })
            }
            placeholder="Any breed"
            className="w-40 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Min age
          </label>
          <Input
            type="number"
            min={0}
            value={filters.minAge ?? ""}
            onChange={(e) =>
              setFilters({
                minAge: e.target.value === "" ? null : Number(e.target.value),
                offset: 0,
              })
            }
            placeholder="0"
            className="w-24 bg-[#10131a] border-gray-800 text-white placeholder:text-gray-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">
            Max age
          </label>
          <Input
            type="number"
            min={0}
            value={filters.maxAge ?? ""}
            onChange={(e) =>
              setFilters({
                maxAge: e.target.value === "" ? null : Number(e.target.value),
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
          <p className="text-gray-400">Loading animals...</p>
        </div>
      ) : (
        <>
          <CustomTable columns={columns} data={animals} />
          <div className="flex items-center justify-end gap-2 text-sm text-gray-400">
            <span>
              Showing {animals.length} · page{" "}
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
              disabled={animals.length < filters.limit}
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
