import type { LoginInput, LoginOutput, User } from "@repo/schemas";
import { ApiError } from "@/lib/api/api-error";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const login = async (input: LoginInput): Promise<LoginOutput> => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const message =
      response.status === 401
        ? "Wrong email or password"
        : "Could not sign in. Please try again.";
    throw new ApiError(response.status, message);
  }

  return response.json();
};

export const fetchCurrentUser = (): Promise<User> =>
  fetchWithAuth<User>("/auth/me");
