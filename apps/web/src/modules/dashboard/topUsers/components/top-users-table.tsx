"use client";

import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useMemo } from "react";
import { FilterSelect } from "./filter-select";
import { TopUser, TopUsersTableProps } from "@/modules/dashboard/topUsers/types";

export function TopUsersTable({ data }: TopUsersTableProps) {
  const columns = useMemo(
    () => [
      {
        header: "Rank",
        accessorKey: "rank",
        cell: ({ row }: { row: { original: TopUser } }) => (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold">#{row.original.rank}</span>
            {row.original.rank <= 3 && <span className="text-yellow-500">🏆</span>}
          </div>
        ),
      },
      {
        header: "User",
        accessorKey: "name",
        cell: ({ row }: { row: { original: TopUser } }) => (
          <div>
            <p className="text-sm font-bold text-white">{row.original.name}</p>
            <p className="text-[10px] text-gray-400">{row.original.email}</p>
          </div>
        ),
      },
      {
        header: "Total Revenue",
        accessorKey: "totalRevenue",
        cell: ({ row }: { row: { original: TopUser } }) => {
          const amount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(row.original.totalRevenue);
          return <span className="text-sm font-bold text-white">{amount}</span>;
        },
      },
    ],
    []
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="bg-[#161a21] rounded-2xl border border-gray-800/50 overflow-hidden">
      <div className="p-6 border-b border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white">Top Revenue Generators</h3>
        <FilterSelect />
      </div>
      <table className="w-full text-left">
        <thead className="bg-[#10131a]">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-800">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-[#1f2937]/40 transition-colors">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-8 py-5">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-8 py-8 text-center text-gray-400 text-sm">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
