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

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return () => {
    clearToken();
    queryClient.clear();
    navigate({ to: "/login", search: { redirect: undefined } });
  };
}
