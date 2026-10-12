import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { EditUserForm } from "@/modules/user/forms/edit-user";
import { BackToUsersButton } from "@/modules/user/forms/back-to-users-button";
import { fetchUser } from "@/modules/user/services";

export const Route = createFileRoute("/administration/users/$userId/edit")({
  component: EditUserPage,
});

function EditUserPage() {
  const { userId } = Route.useParams();
  const navigate = useNavigate();
  const goToList = () => navigate({ to: "/administration/users" });

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
  });

  return (
    <div className="-mt-4 space-y-10">
      <BackToUsersButton />

      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight">Edit User</h2>
        <p className="text-gray-400 mt-1">Update this account's information.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">Loading user...</p>
        </div>
      ) : isError || !user ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-gray-400">User not found.</p>
        </div>
      ) : (
        <EditUserForm user={user} onSaved={goToList} onCancel={goToList} />
      )}
    </div>
  );
}
