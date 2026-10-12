import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import type { Role } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { StatusBadge } from "@/components/status-badge";
import { fetchRoles, deleteRole } from "../services";

const ADMIN_ROLE = "Admin";

export function RolesList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: roles = [],
    isLoading,
    isError,
  } = useQuery({ queryKey: ["roles"], queryFn: fetchRoles });

  const mutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete role", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const handleDelete = (role: Role) => {
    if (
      window.confirm(`Delete the role "${role.name}"? This cannot be undone.`)
    ) {
      mutation.mutate(role.id);
    }
  };

  const columns = useMemo<ColumnDef<Role>[]>(
    () => [
      { header: "Name", accessorKey: "name" },
      {
        header: "Status",
        accessorKey: "isActive",
        cell: ({ getValue }) => (
          <StatusBadge
            label={getValue() ? "Active" : "Inactive"}
            className={
              getValue()
                ? "bg-green-500/15 text-green-400"
                : "bg-gray-500/15 text-gray-400"
            }
          />
        ),
      },
      {
        header: "Permissions",
        accessorFn: (role) => role.permissions.length,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isAdmin = row.original.name === ADMIN_ROLE;
          return (
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
                      to: "/administration/roles/$roleId/edit",
                      params: { roleId: row.original.id },
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
                  disabled={isAdmin}
                  title={
                    isAdmin ? "The Admin role cannot be deleted" : undefined
                  }
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </PopoverContent>
            </Popover>
          );
        },
      },
    ],
    [navigate],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
          <p className="text-gray-400 mt-1">
            Manage roles and their permissions.
          </p>
        </div>
        <Link to="/administration/roles/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create Role
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading roles...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Could not load roles.</p>
        </div>
      ) : (
        <CustomTable columns={columns} data={roles} />
      )}
    </div>
  );
}
