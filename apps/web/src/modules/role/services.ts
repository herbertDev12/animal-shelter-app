import type { CreateRole, Permission, Role, UpdateRole } from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import type { FkOption } from "@/components/fields/rhf-fk-select";

export const fetchRoles = (): Promise<Role[]> =>
  fetchWithAuth<Role[]>("/roles");

export const fetchRole = (id: string): Promise<Role> =>
  fetchWithAuth<Role>(`/roles/${id}`);

export const createRole = (data: CreateRole): Promise<Role> =>
  fetchWithAuth<Role>("/roles", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateRole = (id: string, data: UpdateRole): Promise<Role> =>
  fetchWithAuth<Role>(`/roles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteRole = (id: string): Promise<void> =>
  fetchWithAuth<void>(`/roles/${id}`, { method: "DELETE" });

export const fetchPermissions = (): Promise<Permission[]> =>
  fetchWithAuth<Permission[]>("/permissions");

export const fetchRoleOptions = (): Promise<FkOption[]> =>
  fetchWithAuth<{ value: string; label: string }[]>("/roles/select").then(
    (rows) => rows.map((role) => ({ id: role.value, label: role.label })),
  );
