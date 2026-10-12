import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateRoleForm } from "@/modules/role/forms/create-role";
import { BackToRolesButton } from "@/modules/role/forms/back-to-roles-button";

export const Route = createFileRoute("/administration/roles/new")({
  component: NewRolePage,
});

function NewRolePage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/administration/roles" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToRolesButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create Role</h2>
        <p className="text-gray-400 mt-1">
          Define a role and the permissions it grants.
        </p>
      </div>

      <CreateRoleForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
