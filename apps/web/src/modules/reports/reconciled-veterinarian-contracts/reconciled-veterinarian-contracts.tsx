import { useMemo } from "react";
import { CustomTable } from "@/components/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReconciledVeterinarianContractDto } from "@repo/schemas";
import { useReconciledVeterinarianContracts } from "./useReconciledVeterinarianContracts";

export function ReconciledVeterinarianContractsComponent() {
  const { data: contracts } = useReconciledVeterinarianContracts();

  const columns = useMemo<ColumnDef<ReconciledVeterinarianContractDto>[]>(
    () => [
      {
        header: "Veterinarian Name",
        accessorKey: "veterinarian_name",
        cell: ({ row }) => (
          <span className="text-sm font-bold text-white">
            Dr. {row.original.veterinarian_name}
          </span>
        ),
      },
      {
        header: "Clinic Name",
        accessorKey: "clinic_name",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-300">{getValue() as string}</span>
        ),
      },
      {
        header: "Specialty",
        accessorKey: "specialty",
        cell: ({ getValue }) => (
          <span className="text-xs text-purple-400 font-medium px-2 py-1 rounded-full bg-purple-500/10">
            {getValue() as string}
          </span>
        ),
      },
      {
        id: "location",
        header: "Location",
        accessorFn: (row) => `${row.province}, ${row.address}`,
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-white">{row.original.province}</p>
            <p className="text-[10px] text-gray-400">{row.original.address}</p>
          </div>
        ),
      },
      {
        id: "duration",
        header: "Duration",
        accessorFn: (row) =>
          `${new Date(row.start_date).toLocaleDateString()} - ${new Date(row.end_date).toLocaleDateString()}`,
        cell: ({ row }) => (
          <span className="text-sm text-gray-300 whitespace-nowrap">
            {new Date(row.original.start_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}{" "}
            -{" "}
            {new Date(row.original.end_date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        header: "Reconciliation Date",
        accessorKey: "reconciliation_date",
        cell: ({ row }) => (
          <span className="text-sm text-gray-300">
            {new Date(row.original.reconciliation_date).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            )}
          </span>
        ),
      },
      {
        header: "Description",
        accessorKey: "description",
        cell: ({ row }) => {
          const desc = row.original.description;
          return (
            <span
              className="text-sm text-gray-400 max-w-[240px] block truncate"
              title={desc}
            >
              {desc}
            </span>
          );
        },
      },
    ],
    [],
  );

  console.log("Contracts data:", contracts);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Reconciled Veterinarian Contracts
        </h2>
        <p className="text-gray-400 mt-1">
          View and manage reconciled contracts for shelter veterinarians.
        </p>
      </div>
      <CustomTable columns={columns} data={contracts?.data ?? []} />
    </div>
  );
}
