import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import type { UserWithRole } from "@repo/schemas";
import { CustomTable } from "@/components/custom-table";
import { useSession } from "@/modules/auth/use-session";
import { fetchUsers, deleteUser } from "../services";

export function UsersList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user: currentUser } = useSession();

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({ queryKey: ["users"], queryFn: fetchUsers });

  const mutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully!");
    },
    onError: (error) => {
      toast.error("Failed to delete user", {
        description: error instanceof Error ? error.message : undefined,
      });
    },
  });

  const handleDelete = (user: UserWithRole) => {
    if (
      window.confirm(
        `Delete the account "${user.email}"? This cannot be undone.`,
      )
    ) {
      mutation.mutate(user.id);
    }
  };

  const columns = useMemo<ColumnDef<UserWithRole>[]>(
    () => [
      { header: "Email", accessorKey: "email" },
      { header: "Name", accessorKey: "name" },
      {
        header: "Last name",
        accessorKey: "lastName",
        cell: ({ getValue }) => (getValue() as string | null) ?? "—",
      },
      {
        header: "Role",
        id: "role",
        accessorFn: (user) => user.role.name,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isSelf = row.original.id === currentUser?.id;
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
                      to: "/administration/users/$userId/edit",
                      params: { userId: row.original.id },
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
                  disabled={isSelf}
                  title={
                    isSelf ? "You cannot delete your own account" : undefined
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
    [navigate, currentUser?.id],
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-gray-400 mt-1">
            Manage application accounts and their roles.
          </p>
        </div>
        <Link to="/administration/users/new">
          <Button className="rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold">
            <Plus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading users...</p>
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Could not load users.</p>
        </div>
      ) : (
        <CustomTable columns={columns} data={users} />
      )}
    </div>
  );
}
