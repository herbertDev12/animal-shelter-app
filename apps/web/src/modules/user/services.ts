import type {
  RegisterInput,
  UpdateUser,
  User,
  UserWithRole,
} from "@repo/schemas";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

export const fetchUsers = (): Promise<UserWithRole[]> =>
  fetchWithAuth<UserWithRole[]>("/auth/users");

export const fetchUser = (id: string): Promise<User> =>
  fetchWithAuth<User>(`/auth/users/${id}`);

export const createUser = (data: RegisterInput): Promise<User> =>
  fetchWithAuth<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateUser = (id: string, data: UpdateUser): Promise<User> =>
  fetchWithAuth<User>(`/auth/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteUser = (id: string): Promise<void> =>
  fetchWithAuth<void>(`/auth/users/${id}`, { method: "DELETE" });
