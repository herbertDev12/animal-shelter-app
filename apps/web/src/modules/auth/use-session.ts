import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchCurrentUser } from "./services";
import { clearToken, getToken } from "@/lib/api/token";

export const sessionQueryKey = ["auth", "me"] as const;

export function useSession() {
  const { data: user, isLoading } = useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchCurrentUser,
    enabled: !!getToken(),
    staleTime: Infinity,
    retry: false,
  });

  return { user, isLoading };
}

/** Permissions that unlock the Administration section of the sidebar. */
const ADMINISTRATION_PERMISSIONS = ["auth.read", "role.read"] as const;

/**
 * Client-side gate for the Administration navigation. The API still authorises
 * every admin request, so this only decides what the sidebar renders.
 */
export function useCanAccessAdministration(): boolean {
  const { user } = useSession();

  return ADMINISTRATION_PERMISSIONS.every((permission) =>
    user?.permissions.includes(permission),
  );
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    navigate({ to: "/login", search: { redirect: undefined } });
  };
}
