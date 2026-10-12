import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditRoleForm } from "@/modules/role/forms/edit-role";
import { BackToRolesButton } from "@/modules/role/forms/back-to-roles-button";
import { fetchRole } from "@/modules/role/services";

export const Route = createFileRoute("/administration/roles/$roleId/edit")({
  component: EditRolePage,
});

function EditRolePage() {
  const { roleId } = Route.useParams();
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/administration/roles" });

  const {
    data: role,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["role", roleId],
    queryFn: () => fetchRole(roleId),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToRolesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit Role</h2>
        <p className="text-gray-400 mt-1">Update this role's permissions.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading role...</p>
        </div>
      ) : isError || !role ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Role not found.</p>
        </div>
      ) : (
        <EditRoleForm role={role} onSaved={goToList} onCancel={goToList} />
      )}
    </div>
  );
}
