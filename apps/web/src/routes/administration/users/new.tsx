import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreateUserForm } from "@/modules/user/forms/create-user";
import { BackToUsersButton } from "@/modules/user/forms/back-to-users-button";

export const Route = createFileRoute("/administration/users/new")({
  component: NewUserPage,
});

function NewUserPage() {
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/administration/users" });

  return (
    <div className="-mt-4 space-y-10">
      <BackToUsersButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Create User</h2>
        <p className="text-gray-400 mt-1">
          Add a new account and assign it a role.
        </p>
      </div>

      <CreateUserForm onCreated={goToList} onCancel={goToList} />
    </div>
  );
}
