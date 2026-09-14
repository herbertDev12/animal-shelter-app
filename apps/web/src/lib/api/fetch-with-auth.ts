import { ApiError } from "./api-error";
import { clearToken, getToken } from "./token";
import { readErrorMessage } from "@/lib/utils/read-error-message";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export async function fetchWithAuth<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers = new Headers(init.headers);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (
    init.body &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (response.status === 401) {
    clearToken();
    if (window.location.pathname !== "/login") window.location.assign("/login");
    throw new ApiError(401, "Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      await readErrorMessage(
        response,
        `Request failed with status ${response.status}`,
      ),
    );
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  return (text.length > 0 ? JSON.parse(text) : undefined) as T;
}
