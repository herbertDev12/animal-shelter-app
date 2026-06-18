import { useMemo } from "react";
import { CustomTable } from "@/components/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { ComplementaryServiceContractDto } from "@repo/schemas";
import { useComplementaryServiceContracts } from "./useComplementaryServiceContracts";

export function ComplementaryServiceContractsComponent() {
  const { data: contracts } = useComplementaryServiceContracts();

  const columns = useMemo<ColumnDef<ComplementaryServiceContractDto>[]>(
    () => [
      {
        header: "Service Type",
        accessorKey: "service_type",
        cell: ({ getValue }) => (
          <span className="text-sm font-bold text-white">
            {getValue() as string}
          </span>
        ),
      },
      {
        header: "Cost per Service",
        accessorKey: "cost_per_service",
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-300">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue() as number)}
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

  return (
    <div className="max-w-7xl mx-auto space-y-8 pt-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Complementary Service Contracts
        </h2>
        <p className="text-gray-400 mt-1">
          Track and manage complementary service contracts.
        </p>
      </div>
      <CustomTable columns={columns} data={contracts?.data ?? []} />
    </div>
  );
}
