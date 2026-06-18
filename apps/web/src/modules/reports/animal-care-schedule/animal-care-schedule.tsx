import { useMemo, useState } from "react";
import { CustomTable } from "@/components/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { AnimalCareScheduleDto } from "@repo/schemas";
import { useAnimalCareSchedule } from "./useAnimalCareSchedule";
import { Input } from "@repo/ui";

export function AnimalCareScheduleComponent() {
  const [animalId, setAnimalId] = useState<number>(1);
  const { data: schedule, isLoading } = useAnimalCareSchedule(animalId);

  const columns = useMemo<ColumnDef<AnimalCareScheduleDto>[]>(
    () => [
      {
        header: "Animal",
        accessorKey: "animal_name",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-bold text-white">
              {row.original.animal_name}
            </p>
            <p className="text-[10px] text-gray-400">
              {row.original.species}{" "}
              {row.original.breed ? `(${row.original.breed})` : ""}
            </p>
          </div>
        ),
      },
      {
        header: "Date & Time",
        id: "datetime",
        accessorFn: (row) => `${row.day} ${row.hour}`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm text-white">
              {new Date(row.original.day).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-[10px] text-gray-400">
              {row.original.hour || "N/A"}
            </span>
          </div>
        ),
      },
      {
        header: "Activity",
        accessorKey: "activity_description",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-300">
            {(getValue() as string) || "No description"}
          </span>
        ),
      },
      {
        header: "Veterinarian",
        accessorKey: "assigned_veterinarian_name",
        cell: ({ getValue }) => (
          <span className="text-sm text-purple-400 font-medium">
            {(getValue() as string) || "Unassigned"}
          </span>
        ),
      },
      {
        header: "Food",
        accessorKey: "assigned_food_type",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-300">
            {(getValue() as string) || "None"}
          </span>
        ),
      },
      {
        header: "Total Cost",
        accessorKey: "total_maintenance_cost",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold text-white">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue() as number)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Animal Care Schedule
          </h2>
          <p className="text-gray-400 mt-1">
            View detailed care activities and costs for a specific animal.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-400 whitespace-nowrap">
            Animal ID:
          </label>
          <Input
            type="number"
            value={animalId}
            onChange={(e) => setAnimalId(Number(e.target.value))}
            className="w-24 h-9 bg-[#161a21] border-[#1a1f2e]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Loading schedule...</p>
        </div>
      ) : (
        <CustomTable columns={columns} data={schedule?.data ?? []} />
      )}
    </div>
  );
}
