import { useMemo } from "react";
import { CustomTable } from "@/components/custom-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { RevenuePlanDto } from "@repo/schemas";
import { useRevenuePlan } from "./useRevenuePlan";

export function RevenuePlanComponent() {
  const { data: plan } = useRevenuePlan();

  const columns = useMemo<ColumnDef<RevenuePlanDto>[]>(
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
        header: "Maint. Cost",
        accessorKey: "total_maintenance_cost",
        cell: ({ getValue }) => (
          <span className="text-sm text-red-400">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue() as number)}
          </span>
        ),
      },
      {
        header: "Adoption Fee",
        accessorKey: "total_adoption_fee",
        cell: ({ getValue }) => (
          <span className="text-sm text-green-400">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue() as number)}
          </span>
        ),
      },
      {
        header: "Donations",
        accessorKey: "total_donations",
        cell: ({ getValue }) => (
          <span className="text-sm text-blue-400">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "USD",
            }).format(getValue() as number)}
          </span>
        ),
      },
      {
        header: "Total Revenue",
        accessorKey: "total_revenue",
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Revenue Plan</h2>
        <p className="text-gray-400 mt-1">
          Financial overview of maintenance costs vs revenues per animal.
        </p>
      </div>
      <CustomTable columns={columns} data={plan?.data ?? []} />
    </div>
  );
}
