import { createFileRoute } from "@tanstack/react-router";
import { RolesList } from "@/modules/role/list/roles-list";

export const Route = createFileRoute("/administration/roles/")({
  component: RolesList,
});
