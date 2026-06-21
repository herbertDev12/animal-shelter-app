import type {
  Activity,
  CreateActivity,
  SearchActivityFilters,
} from "@repo/schemas";

const API_URL = import.meta.env.VITE_PUBLIC_API_URL;

export const fetchActivities = async (
  filters: Partial<SearchActivityFilters> = {},
): Promise<Activity[]> => {
  const params = new URLSearchParams();

  if (filters.id_animal != null)
    params.append("id_animal", String(filters.id_animal));
  if (filters.id_service != null)
    params.append("id_service", String(filters.id_service));
  if (filters.date_from) params.append("date_from", filters.date_from);
  if (filters.date_to) params.append("date_to", filters.date_to);
  if (filters.limit != null) params.append("limit", String(filters.limit));
  if (filters.offset != null) params.append("offset", String(filters.offset));

  const response = await fetch(
    `${API_URL}/activities/search?${params.toString()}`,
  );
  if (!response.ok) throw new Error("Failed to fetch activities");
  return response.json();
};

export const fetchActivity = async (id: number): Promise<Activity> => {
  const response = await fetch(`${API_URL}/activities/${id}`);
  if (!response.ok) throw new Error("Failed to fetch activity");
  return response.json();
};

export const createActivity = async (
  data: CreateActivity,
): Promise<Activity> => {
  const response = await fetch(`${API_URL}/activities`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create activity");
  return response.json();
};

export const updateActivity = async (
  id: number,
  data: Partial<CreateActivity>,
): Promise<Activity> => {
  const response = await fetch(`${API_URL}/activities/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update activity");
  return response.json();
};

export const deleteActivity = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/activities/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete activity");
};
