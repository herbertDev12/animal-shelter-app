import { useMemo } from "react";
import { CustomTable } from "@/components/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ActiveVeterinarianDto } from "@repo/schemas";
import { useActiveVeterinarians } from "./useActiveVeterinarians";

export function ActiveVeterinariansComponent() {
  const { data: veterinarians } = useActiveVeterinarians();

  const columns = useMemo<ColumnDef<ActiveVeterinarianDto>[]>(
    () => [
      {
        header: "Veterinarian",
        accessorKey: "veterinarian_name",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold text-white">
            {getValue() as string}
          </span>
        ),
      },
      {
        header: "Clinic",
        accessorKey: "clinic_name",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-300">{getValue() as string}</span>
        ),
      },
      {
        header: "Specialty",
        accessorKey: "specialty",
        cell: ({ getValue }) => (
          <span className="text-sm text-purple-400 font-medium">
            {getValue() as string}
          </span>
        ),
      },
      {
        header: "Province",
        accessorKey: "province",
        cell: ({ getValue }) => (
          <span className="text-sm text-white">{getValue() as string}</span>
        ),
      },
      {
        id: "contact",
        header: "Contact",
        accessorFn: (row) => `${row.email} ${row.phone}`,
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm text-white">{row.original.email}</span>
            <span className="text-[10px] text-gray-400">
              {row.original.phone}
            </span>
          </div>
        ),
      },
      {
        header: "Modalities",
        accessorKey: "modalities",
        cell: ({ row }) => {
          const modalities = row.original.modalities;
          if (!modalities) return <span className="text-gray-500">-</span>;
          return (
            <span
              className="text-sm text-gray-400 max-w-[200px] block truncate"
              title={modalities}
            >
              {modalities}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Active Veterinarians
        </h2>
        <p className="text-gray-400 mt-1">
          List of veterinarians currently active in clinics.
        </p>
      </div>
      <CustomTable columns={columns} data={veterinarians?.data ?? []} />
    </div>
  );
}
