import { createFileRoute } from "@tanstack/react-router";
import { UsersList } from "@/modules/user/list/users-list";

export const Route = createFileRoute("/administration/users/")({
  component: UsersList,
});
